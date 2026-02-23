import { JsonLogger } from './json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;

  beforeEach(() => {
    logger = new JsonLogger();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('форматирует сообщение в JSON и пишет в stdout', () => {
    const stdoutSpy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);

    logger.log('Hello', 'ctx');

    expect(stdoutSpy).toHaveBeenCalledTimes(1);

    const loggedString = stdoutSpy.mock.calls[0][0] as string;
    expect(typeof loggedString).toBe('string');

    const parsed = JSON.parse(loggedString.trim());

    expect(parsed).toMatchObject({
      level: 'log',
      message: 'Hello',
    });

    expect(parsed.optionalParams).toBeDefined();
  });

  it('пишет ошибки в stderr', () => {
    const stderrSpy = jest
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);

    logger.error('Boom', 'stacktrace');

    expect(stderrSpy).toHaveBeenCalledTimes(1);

    const loggedString = stderrSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(loggedString.trim());

    expect(parsed.level).toBe('error');
    expect(parsed.message).toBe('Boom');
  });

  it('сериализует объект сообщения', () => {
    const stdoutSpy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);

    logger.log({ event: 'user_created', id: 1 });

    expect(stdoutSpy).toHaveBeenCalledTimes(1);

    const loggedString = stdoutSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(loggedString.trim());

    expect(parsed.level).toBe('log');
    expect(parsed.message).toEqual({ event: 'user_created', id: 1 });
  });
});
