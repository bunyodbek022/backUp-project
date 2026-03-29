import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: ['http://localhost:5173', 'http://localhost:3001'],
        credentials: true,
        exposedHeaders: ['Content-Disposition'],
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    app.setGlobalPrefix('api');

    const config = new DocumentBuilder()
        .setTitle('Backup Management System API')
        .setDescription('API for managing database sources, backups, restores, logs, and backup policies')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true, 
        },
    });

    await app.listen(3000);
}
bootstrap();