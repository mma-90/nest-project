import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { SnakeNamingStrategy } from './snake-naming-strategy';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

export interface IEnvConfig {
	[key: string]: string;
}

export class ConfigService {
	private readonly ENV_CONFIG: IEnvConfig;
	PORT: string;
	DATABASE_USER: string;
	DATABASE_PASSWORD: string;
	DATABASE_NAME: string;
	DATABASE_PORT: string;
	DATABASE_HOST: string;
	DATABASE_TYPE: string;
	NODE_ENV: string;
	TYPEORM_MIGRATIONS: string;
	TYPEORM_SYNCHRONIZE: string;

	constructor(environment: string) {
		const filePath = `./env/${environment}.env`;
		console.log('env:', environment);

		if (fs.existsSync(filePath)) {
			const config = dotenv.parse(fs.readFileSync(filePath));
			this.ENV_CONFIG = this.validateInput(config);
		} else {
			const globalSecretEnv = JSON.parse(process.env.GLOBAL_SECRET_ENV || '{}');
			const globalPublicEnv = JSON.parse(process.env.GLOBAL_PUBLIC_ENV || '{}');
			this.ENV_CONFIG = this.validateInput({
				...globalSecretEnv,
				...globalPublicEnv
			});
		}
		this.initializeVariables();
	}

	private validateInput(envConfig: IEnvConfig): IEnvConfig {
		const envVarsSchema = Joi.object({
			PORT: Joi.string().required(),
			NODE_ENV: Joi.string().default('development'),
			DATABASE_PORT: Joi.number().default(3000),
			DATABASE_USER: Joi.string().required(),
			DATABASE_PASSWORD: Joi.string().required(),
			DATABASE_NAME: Joi.string().required(),
			DATABASE_HOST: Joi.string().required(),
			DATABASE_TYPE: Joi.string().required(),
			TYPEORM_MIGRATIONS: Joi.boolean().required(),
			TYPEORM_SYNCHRONIZE: Joi.boolean().required()
		});

		const { error, value: validatedEnvConfig } = envVarsSchema.validate(envConfig);

		if (error) {
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			throw new Error(`Config validation error: ${error?.message}`);
		}

		return validatedEnvConfig;
	}

	private initializeVariables(): void {
		this.PORT = this.ENV_CONFIG.PORT;
		this.NODE_ENV = this.ENV_CONFIG.NODE_ENV;
		this.DATABASE_PASSWORD = this.ENV_CONFIG.DATABASE_PASSWORD;
		this.DATABASE_PORT = this.ENV_CONFIG.DATABASE_PORT;
		this.DATABASE_USER = this.ENV_CONFIG.DATABASE_USER;
		this.DATABASE_NAME = this.ENV_CONFIG.DATABASE_NAME;
		this.DATABASE_HOST = this.ENV_CONFIG.DATABASE_HOST;
		this.DATABASE_TYPE = this.ENV_CONFIG.DATABASE_TYPE;
		this.TYPEORM_MIGRATIONS = this.ENV_CONFIG.TYPEORM_MIGRATIONS;
		this.TYPEORM_SYNCHRONIZE = this.ENV_CONFIG.TYPEORM_SYNCHRONIZE;
	}

	private isTrue(value: any): boolean {
		return String(value) === 'true';
	}

	get typeOrmConfig(): TypeOrmModuleOptions {
		return {
			type: 'postgres',
			host: this.DATABASE_HOST,
			port: +this.DATABASE_PORT,
			username: this.DATABASE_USER,
			password: this.DATABASE_PASSWORD,
			database: this.DATABASE_NAME,
			subscribers: [],
			migrationsRun: this.isTrue(this.TYPEORM_MIGRATIONS),
			logging: this.NODE_ENV === 'development',
			namingStrategy: new SnakeNamingStrategy(),
			autoLoadEntities: true,
			synchronize: this.isTrue(this.TYPEORM_SYNCHRONIZE),
			entities: [__dirname + '/modules/*/*.entity{.ts,.js}'],
			migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
			migrationsTableName: 'migrations'
		};
	}
}
