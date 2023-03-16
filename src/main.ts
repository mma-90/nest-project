import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as cors from 'cors';
import * as compression from 'compression';
import * as morgan from 'morgan';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger/dist';
import { AppModule } from './app.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	//Global PIPES
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			transformOptions: { enableImplicitConversion: true }
		})
	);

	// Global Middleware
	app.use(helmet());
	app.use(cors({ origin: '*', exposedHeaders: [''] }));
	app.use(compression());
	app.use(morgan('combined'));

	// const reflector = app.get(Reflector);
	const configService = app.select(ConfigModule).get(ConfigService);

	// Swagger
	const swaggerConfig = new DocumentBuilder().setTitle('Contact API').setDescription('Contact APIs').setVersion('1.0').build();

	const document = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup('api', app, document);

	const PORT = +configService.PORT;
	await app.listen(PORT);
}
bootstrap();
