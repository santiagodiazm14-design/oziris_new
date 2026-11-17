import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');
// El servicio recarga el .env real en cada envío; lo aislamos para que el test
// no dependa de las credenciales de correo configuradas en la máquina.
jest.mock('dotenv', () => ({ config: jest.fn() }));

describe('MailService', () => {
  let service: MailService;
  const mockSendMail = jest.fn();
  const originalEnv = { ...process.env };

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.MAIL_USER = 'test@oziris.com';
    process.env.MAIL_PASS = 'abcd efgh ijkl mnop';
    delete process.env.MAIL_HOST;
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debe enviar correo de recuperación con éxito cuando nodemailer responde ok', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-msg-123' });

    const result = await service.sendPasswordResetEmail(
      'usuario@test.com',
      '123456',
    );
    expect(result.success).toBe(true);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'usuario@test.com',
        subject: expect.stringContaining('123456'),
      }),
    );
  });

  it('debe manejar errores de envío sin romper la ejecución', async () => {
    mockSendMail.mockRejectedValue(new Error('SMTP Connection Error'));

    const result = await service.sendPasswordResetEmail(
      'usuario@test.com',
      '123456',
    );
    expect(result.success).toBe(false);
    expect(result.message).toBe('SMTP Connection Error');
  });
});
