import { DataSource, Repository } from 'typeorm';
import { handleError } from '../../../../error-handler';
import { BackListTokenEntity } from '../../entity';

export class BlackListTokenRepository extends Repository<BackListTokenEntity> {
    constructor(dataSource: DataSource) {
        super(BackListTokenEntity, dataSource.createEntityManager());
    }

    public async createBlackListToken(
        token: Partial<BackListTokenEntity>,
    ): Promise<BackListTokenEntity> {
        return handleError(async () => {
            const newToken = this.create(token);
            return this.save(newToken);
        });
    }

    public async findBlackListTokenByToken(token: string): Promise<BackListTokenEntity | null> {
        return handleError(async () => {
            const getToken = await this.findOne({ where: { token: token } });
            return getToken;
        });
    }
}
