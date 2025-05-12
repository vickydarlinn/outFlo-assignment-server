import fs from "fs";
import path from "path";
import BaseAuthStrategy from "./baseAuthStrategy";

interface LocalAuthOptions {
  clientId?: string;
  dataPath?: string;
}

export default class LocalAuth extends BaseAuthStrategy {
  private userDataDir?: string;

  constructor(private readonly opts: LocalAuthOptions = {}) {
    super();
    this.opts.clientId ??= "default";
    this.opts.dataPath ??= "./.linkedin_auth";

    if (!/^[\w-]+$/.test(this.opts.clientId))
      throw new Error("clientId may only contain letters, numbers, _ or -");
  }

  async beforeBrowserInitialized() {
    const dirName = `session-${this.opts.clientId}`;
    const dirPath = path.join(this.opts.dataPath!, dirName);
    fs.mkdirSync(dirPath, { recursive: true });

    // force puppeteer to reuse this profile
    const pOpts = this.client.options.puppeteer;
    this.client.options.puppeteer = { ...pOpts, userDataDir: dirPath };
    this.userDataDir = dirPath;
  }

  async logout() {
    if (this.userDataDir)
      await fs.promises.rm(this.userDataDir, { recursive: true, force: true });
  }
}
