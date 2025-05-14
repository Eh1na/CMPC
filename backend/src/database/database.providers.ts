import { Sequelize } from 'sequelize-typescript';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';
import { AuditLog } from '../audit/audit-log.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        models: [User, Book, AuditLog],
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        sync: { force: process.env.SYNC_DB === 'true' }
      });

      try {
        await sequelize.authenticate();
        console.log('Database connection established successfully');

        if (process.env.SYNC_DB === 'true') {
          await sequelize.sync();
          console.log('Database synchronized');
        }
      } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
      }

      return sequelize;
    },
  },

  {
    provide: 'USER_REPOSITORY',
    useValue: User,
  },
  {
    provide: 'BOOK_REPOSITORY',
    useValue: Book,
  },
  {
    provide: 'AUDIT_LOG_REPOSITORY',
    useValue: AuditLog,
  }
];