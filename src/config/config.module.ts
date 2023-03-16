import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({
	providers: [
		{
			provide: ConfigService,
			useValue: new ConfigService(process.env.NODE_ENV?.trim())
		}
	],
	exports: [ConfigService]
})
export class ConfigModule {}
