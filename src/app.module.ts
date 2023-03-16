import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';

@Module({
	controllers: [AppController],
	providers: [AppService],
	imports: [TypeOrmModule.forRootAsync({ imports: [ConfigModule], useFactory: (configService: ConfigService) => configService.typeOrmConfig, inject: [ConfigService] })]
})
export class AppModule {}
