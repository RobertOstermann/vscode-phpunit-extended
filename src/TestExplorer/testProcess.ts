import { ChildProcess, spawn, SpawnOptions } from "child_process";

export default class TestProcess {
  private process: ChildProcess | null = null;

  /**
   * Creates a child process to execute a command.
   * 
   * @param command - The command to run.
   * @param args - A list of string arguments.
   * @param options - The working directory and environment variables.
   * @returns The output of the child process.
   */
  run(command: string, args: string[], options: SpawnOptions): Promise<string> {
    return new Promise((resolve) => {

      const buffers: any[] = [];

      this.process = spawn(
        command,
        args,
        options
      );

      if (!this.process) {
        return;
      }

      this.process.stdout?.on("data", data => {
        buffers.push(data);
      });

      this.process.on("error", (error: any) => {
        resolve(error.message);
      });

      this.process.on("close", () => {
        const output = buffers.reduce((response, buffer) => {
          response += buffer.toString();
          return (response);
        }, "");

        resolve(output);
      });
    });
  }
}
