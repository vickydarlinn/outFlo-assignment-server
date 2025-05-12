export interface AuthResult {
  failed: boolean;
  restart?: boolean;
}

export default abstract class BaseAuthStrategy {
  protected client!: import("../linkedin.client").LinkedInClient;

  public setup(client: import("../linkedin.client").LinkedInClient) {
    this.client = client;
  }

  beforeBrowserInitialized(): Promise<void> | void {}
  afterBrowserInitialized(): Promise<void> | void {}
  onAuthenticationNeeded(): Promise<AuthResult> | AuthResult {
    return { failed: false };
  }
  afterAuthReady(): Promise<void> | void {}
  logout(): Promise<void> | void {}
  destroy(): Promise<void> | void {}
}
