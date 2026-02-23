import { TskvLogger } from './tskv.logger';

describe('TskvLogger', () => {
  let logger: TskvLogger;

  beforeEach(() => {
    logger = new TskvLogger();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('форматирует сообщение в TSKV и пишет в stdout', () => {
    const stdoutSpy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);

    logger.log('Hello');

    expect(stdoutSpy).toHaveBeenCalledTimes(1);

    const out = stdoutSpy.mock.calls[0][0] as string;

    expect(typeof out).toBe('string');
    expect(out.startsWith('tskv\t')).toBe(true);
    expect(out).toContain('\tlevel=log');
    expect(out).toContain('\tmessage=Hello');
  });

  it('экранирует спецсимволы в TSKV', () => {
    const stdoutSpy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);

    logger.log('a\tb\nc=d\\e');

    expect(stdoutSpy).toHaveBeenCalledTimes(1);

    const out = stdoutSpy.mock.calls[0][0] as string;

    expect(out).toContain('message=a\\tb\\nc\\=d\\\\e');
  });

  it('пишет error в stderr', () => {
    const stderrSpy = jest
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);

    logger.error('Oops');

    expect(stderrSpy).toHaveBeenCalledTimes(1);

    const out = stderrSpy.mock.calls[0][0] as string;

    expect(typeof out).toBe('string');
    expect(out).toContain('\tlevel=error');
    expect(out).toContain('\tmessage=Oops');
  });
});
