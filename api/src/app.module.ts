import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhiteboardGateway } from './whiteboard/whiteboard.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, WhiteboardGateway],
})
export class AppModule {}
