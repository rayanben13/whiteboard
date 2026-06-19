import { Test, TestingModule } from '@nestjs/testing';
import { WhiteboardGateway } from './whiteboard.gateway';

describe('WhiteboardGateway', () => {
  let gateway: WhiteboardGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WhiteboardGateway],
    }).compile();

    gateway = module.get<WhiteboardGateway>(WhiteboardGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
