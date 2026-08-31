import { BranchStatus, Roles, RosterStatus } from '../config/enum';
import { IJwtPayload } from '../config/interface';
import { RosterListResponseDto, RosterResponseDto } from '../dto/roster';
import { messages } from '../lang/api-messages';
import { RosterRepository } from '../utils/database/db/repository/roster';
import { UserRepository } from '../utils/database/db/repository/user';
import { BranchEntity, TrainerRosterEntity, UserEntity } from '../utils/database/db/entity';
import { BadRequestException, NotFoundException } from '../utils/error';
import {
    CreateRosterBodyPayload,
    RosterIdParamsPayload,
    UpdateRosterStatusBodyPayload,
} from '../validations/roster.validations';

interface NormalizedRosterEntry {
    dayOfWeek: string;
    branchId: string;
    trainerId: string;
    startTime: string;
    endTime: string;
}

export class RosterService {
    constructor(
        private readonly rosterRepo: RosterRepository,
        private readonly userRepo: UserRepository,
    ) {}

    async createRosters(
        body: CreateRosterBodyPayload,
        authUser: IJwtPayload,
    ): Promise<RosterResponseDto[]> {
        const entries = this.removeDuplicateEntries(body.rosters);
        const existingRosters = await this.rosterRepo.findRostersByEntries(entries);
        const existingRosterMap = this.buildRosterEntryMap(existingRosters);

        await this.ensureEntriesValid(entries, authUser, existingRosterMap);

        const unchangedRosters: TrainerRosterEntity[] = [];
        const rosterPayloads: Partial<TrainerRosterEntity>[] = [];
        entries.forEach((entry) => {
            const existingRoster = existingRosterMap.get(this.getRosterEntryKey(entry));
            if (
                existingRoster &&
                this.normalizeTime(existingRoster.start_time) === entry.startTime &&
                this.normalizeTime(existingRoster.end_time) === entry.endTime &&
                existingRoster.status === RosterStatus.Working
            ) {
                unchangedRosters.push(existingRoster);
                return;
            }

            rosterPayloads.push({
                ...(existingRoster ? { id: existingRoster.id } : {}),
                day_of_week: entry.dayOfWeek as TrainerRosterEntity['day_of_week'],
                branch: { id: entry.branchId } as BranchEntity,
                trainer: { id: entry.trainerId } as UserEntity,
                start_time: entry.startTime,
                end_time: entry.endTime,
                status: RosterStatus.Working,
            });
        });
        const savedRosters = await this.rosterRepo.saveRostersByCombination(rosterPayloads);
        const rosters = [...savedRosters, ...unchangedRosters];

        return rosters.map((roster) => new RosterResponseDto(roster));
    }

    async updateRosterStatus(
        body: UpdateRosterStatusBodyPayload,
        authUser: IJwtPayload,
    ): Promise<RosterResponseDto[]> {
        const assignedBranchIds = await this.getAssignedBranchIds(authUser);
        const rosters = await this.rosterRepo.updateRosterStatusByDay(
            body.dayOfWeek,
            body.status,
            assignedBranchIds,
        );

        if (!rosters.length) {
            throw new NotFoundException(messages.rosterNotFound);
        }

        return rosters.map((roster) => new RosterResponseDto(roster));
    }

    async deleteRoster(params: RosterIdParamsPayload, authUser: IJwtPayload): Promise<void> {
        await this.getRoster(params.id, authUser);
        await this.rosterRepo.softDeleteRoster(params.id);
    }

    async getRosterById(
        params: RosterIdParamsPayload,
        authUser: IJwtPayload,
    ): Promise<RosterResponseDto> {
        return new RosterResponseDto(await this.getRoster(params.id, authUser));
    }

    async listRosters(authUser: IJwtPayload): Promise<RosterListResponseDto> {
        const assignedBranchIds = await this.getAssignedBranchIds(authUser);
        const rosters = await this.rosterRepo.listRosters(assignedBranchIds);

        return new RosterListResponseDto(rosters);
    }

    private async getRoster(id: string, authUser: IJwtPayload): Promise<TrainerRosterEntity> {
        const roster = await this.rosterRepo.findRosterById(
            id,
            await this.getAssignedBranchIds(authUser),
        );
        if (!roster) {
            throw new NotFoundException(messages.rosterNotFound);
        }

        return roster;
    }

    private async ensureEntriesValid(
        entries: NormalizedRosterEntry[],
        authUser: IJwtPayload,
        existingRosterMap?: Map<string, TrainerRosterEntity>,
    ): Promise<void> {
        this.ensureNoPayloadOverlaps(entries);

        const branchIds = [...new Set(entries.map((entry) => entry.branchId))];
        const trainerIds = [...new Set(entries.map((entry) => entry.trainerId))];
        const [branches, trainers] = await Promise.all([
            this.rosterRepo.findActiveBranchesByIds(branchIds),
            this.rosterRepo.findActiveAssignedTrainersByIds(trainerIds),
        ]);
        const branchMap = new Map(branches.map((branch) => [branch.id, branch]));
        const trainerMap = new Map(trainers.map((trainer) => [trainer.id, trainer]));
        const assignedBranchIds = await this.getAssignedBranchIds(authUser);

        for (const entry of entries) {
            const branch = branchMap.get(entry.branchId);
            if (!branch || branch.status !== BranchStatus.Active) {
                throw new BadRequestException(messages.rosterBranchNotActive);
            }

            if (assignedBranchIds && !assignedBranchIds.includes(entry.branchId)) {
                throw new BadRequestException(messages.rosterBranchNotAllowed);
            }

            const trainer = trainerMap.get(entry.trainerId);
            if (!trainer) {
                throw new BadRequestException(messages.rosterTrainerNotActive);
            }

            const trainerBranchIds =
                trainer.userBranches
                    ?.map((userBranch) => userBranch.branch?.id)
                    .filter((branchId): branchId is string => Boolean(branchId)) || [];
            if (!trainerBranchIds.includes(entry.branchId)) {
                throw new BadRequestException(messages.rosterTrainerNotAssignedToBranch);
            }

            if (!branch.opening_time || !branch.closing_time) {
                throw new BadRequestException(messages.rosterBranchTimingMissing);
            }

            const branchOpeningTime = this.normalizeTime(branch.opening_time);
            const branchClosingTime = this.normalizeTime(branch.closing_time);
            if (entry.startTime < branchOpeningTime || entry.endTime > branchClosingTime) {
                throw new BadRequestException(messages.rosterTimeOutsideBranchHours);
            }
        }

        const existingOverlaps = await this.rosterRepo.findOverlappingRosters(
            entries.map((entry) => ({
                trainerId: entry.trainerId,
                dayOfWeek: entry.dayOfWeek,
                startTime: entry.startTime,
                endTime: entry.endTime,
                excludeRosterId: existingRosterMap?.get(this.getRosterEntryKey(entry))?.id,
            })),
        );
        if (existingOverlaps.length) {
            throw new BadRequestException(messages.rosterTimeConflict);
        }
    }

    private ensureNoPayloadOverlaps(entries: NormalizedRosterEntry[]): void {
        for (let firstIndex = 0; firstIndex < entries.length; firstIndex += 1) {
            for (let secondIndex = firstIndex + 1; secondIndex < entries.length; secondIndex += 1) {
                const first = entries[firstIndex];
                const second = entries[secondIndex];
                const isSameEntry =
                    first.branchId === second.branchId &&
                    first.trainerId === second.trainerId &&
                    first.dayOfWeek === second.dayOfWeek &&
                    first.startTime === second.startTime &&
                    first.endTime === second.endTime;
                if (isSameEntry) {
                    continue;
                }

                if (
                    first.trainerId === second.trainerId &&
                    first.dayOfWeek === second.dayOfWeek &&
                    first.startTime < second.endTime &&
                    first.endTime > second.startTime
                ) {
                    throw new BadRequestException(messages.rosterPayloadTimeConflict);
                }
            }
        }
    }

    private removeDuplicateEntries(entries: NormalizedRosterEntry[]): NormalizedRosterEntry[] {
        const entriesByKey = new Map<string, NormalizedRosterEntry>();
        entries.forEach((entry) => {
            entriesByKey.set(
                `${this.getRosterCombinationKey(entry)}:${entry.startTime}:${entry.endTime}`,
                entry,
            );
        });

        return Array.from(entriesByKey.values());
    }

    private buildRosterEntryMap(rosters: TrainerRosterEntity[]): Map<string, TrainerRosterEntity> {
        const rosterMap = new Map<string, TrainerRosterEntity>();
        rosters.forEach((roster) => {
            const rosterKey = this.getRosterEntryKey({
                branchId: roster.branch.id,
                trainerId: roster.trainer.id,
                dayOfWeek: roster.day_of_week,
                startTime: this.normalizeTime(roster.start_time),
                endTime: this.normalizeTime(roster.end_time),
            });
            if (!rosterMap.has(rosterKey)) {
                rosterMap.set(rosterKey, roster);
            }
        });

        return rosterMap;
    }

    private getRosterEntryKey(entry: NormalizedRosterEntry): string {
        return `${this.getRosterCombinationKey(entry)}:${entry.startTime}:${entry.endTime}`;
    }

    private getRosterCombinationKey(
        entry: Pick<NormalizedRosterEntry, 'branchId' | 'trainerId' | 'dayOfWeek'>,
    ): string {
        return `${entry.branchId}:${entry.trainerId}:${entry.dayOfWeek}`;
    }

    private async getAssignedBranchIds(authUser?: IJwtPayload): Promise<string[] | undefined> {
        if (authUser?.roleName !== Roles.SubAdmin) {
            return undefined;
        }

        return this.userRepo.findAssignedBranchIds(authUser.userId);
    }

    private normalizeTime(time: string): string {
        return time.slice(0, 5);
    }
}
