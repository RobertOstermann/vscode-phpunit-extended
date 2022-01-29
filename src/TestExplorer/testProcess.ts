import { ChildProcess, spawn, SpawnOptions } from 'child_process';

export default class TestProcess {
  private process: ChildProcess | null = null;
  private reject: Function | null = null;

  run(command: string, args: string[], options: SpawnOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      this.reject = reject;

      const buffers: any[] = [];

      this.process = spawn(
        command,
        args,
        options
      );

      if (!this.process) {
        return;
      }

      this.process.stdout?.on('data', data => {
        buffers.push(data);
      });

      this.process.stderr?.on('data', data => {
        buffers.push(data);
      });

      this.process.on('error', (error: any) => {
        resolve(error.message);
      });

      this.process.on('close', () => {
        const output = buffers.reduce((response, buffer) => {
          response += buffer.toString();
          return (response);
        }, '');

        resolve(output);
      });
    });
  }
}
