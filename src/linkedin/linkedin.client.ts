import EventEmitter from "events";
import puppeteer, { Browser, Page } from "puppeteer";
import { DefaultOptions } from "./defaultOptions";
import BaseAuthStrategy from "./authStrategies/baseAuthStrategy";

/* ----------  SHARED TYPES  ---------- */

export interface LinkedInOptions {
  authStrategy: BaseAuthStrategy;
  puppeteer?: Parameters<typeof puppeteer.launch>[0] & {
    browserWSEndpoint?: string;
  };
}

export interface PersonCard {
  name: string | null;
  country: string | null;
  photoUrl: string | null;
  profileUrl: string | null;
}

/* ----------  MAIN CLIENT  ---------- */

export class LinkedInClient extends EventEmitter {
  public options: LinkedInOptions;
  public browser!: Browser;
  public page!: Page;
  public authStrategy: BaseAuthStrategy;

  constructor(opts: LinkedInOptions) {
    super();
    this.options = { ...DefaultOptions, ...opts };
    if (!this.options.authStrategy) throw new Error("authStrategy is required");

    this.authStrategy = this.options.authStrategy;
    this.authStrategy.setup(this);
  }

  /* ----------  LIFECYCLE  ---------- */

  async initialize() {
    await this.authStrategy.beforeBrowserInitialized();

    const pOpts = this.options.puppeteer ?? {};
    if (pOpts.browserWSEndpoint) {
      this.browser = await puppeteer.connect(pOpts);
      this.page = await this.browser.newPage();
    } else {
      this.browser = await puppeteer.launch(pOpts);
      [this.page] = await this.browser.pages();
      this.page.setDefaultNavigationTimeout(60_000);
    }

    await this.authStrategy.afterBrowserInitialized();

    await this.page.goto("https://www.linkedin.com/", {
      waitUntil: "load",
      timeout: 0,
    });

    // LinkedIn redirects to /feed or /login after initial load
    try {
      await this.page.waitForNavigation({
        waitUntil: "networkidle2",
        timeout: 15_000,
      });
    } catch {
      /* no redirect is fine */
    }

    if (!(await this.isLoggedIn())) {
      const { failed } = await this.authStrategy.onAuthenticationNeeded();
      if (failed) {
        this.emit("auth_failure");
        await this.destroy();
        return;
      }
      console.log("Please log in to LinkedIn in the opened browser window…");
      await this.waitForManualLogin();
    }

    this.emit("authenticated");
    await this.authStrategy.afterAuthReady();
    this.emit("ready");
  }

  /* ----------  PUBLIC API  ---------- */

  async fetchPeople(url: string, limit = 10): Promise<PersonCard[]> {
    if (!/^https:\/\/www\.linkedin\.com\/search\/results\/people\//.test(url))
      throw new Error("URL must be a LinkedIn people-search URL");

    const collected: PersonCard[] = [];

    await this.page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    let currentPage = 1;

    while (collected.length < limit) {
      console.log(`[LinkedIn] Processing page ${currentPage}…`);

      await this.thoroughScroll();
      const need = limit - collected.length;
      const newItems = await this.scrapeCurrentPage(need);

      // de-dupe
      newItems.forEach((p) => {
        if (!collected.find((c) => c.profileUrl === p.profileUrl))
          collected.push(p);
      });

      if (
        collected.length >= limit ||
        !(await this.hasNextPage()) ||
        !(await this.navigateToNextPage(currentPage))
      )
        break;

      currentPage++;
    }

    return collected.slice(0, limit);
  }

  /* ----------  PRIVATE HELPERS (login) ---------- */

  private async isLoggedIn(): Promise<boolean> {
    return this.page.evaluate(
      () => !document.querySelector('a[href*="login"], a[href*="signin"]')
    );
  }

  private async waitForManualLogin(maxSec = 180): Promise<void> {
    const deadline = Date.now() + maxSec * 1_000;
    while (Date.now() < deadline) {
      if (await this.isLoggedIn()) return;
      await new Promise((r) => setTimeout(r, 1_000));
    }
    throw new Error("Login not detected within the expected time.");
  }

  /* ----------  PRIVATE HELPERS (scroll / pagination / scrape) ---------- */

  /** Aggressive scrolling so every lazy-loaded card & pagination bar renders */
  private async thoroughScroll(): Promise<void> {
    console.log("[LinkedIn] Performing thorough scroll…");

    // 1) Hard scroll to bottom until nothing moves
    await this.page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let last = 0;
        const run = () => {
          window.scrollTo(0, document.body.scrollHeight);
          const now = window.pageYOffset || document.documentElement.scrollTop;
          if (now === last) return resolve();
          last = now;
          setTimeout(run, 400);
        };
        run();
      });
    });

    // 2) Scroll in 10 chunks
    await this.page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        window.scrollTo(0, 0);
        const scrollHeight = document.body.scrollHeight;
        const viewport = window.innerHeight;
        const step = Math.floor(scrollHeight / 10);
        let count = 0;

        const run = () => {
          count++;
          if (count > 20) return resolve();
          const next = Math.min(
            window.pageYOffset + step,
            scrollHeight - viewport
          );
          window.scrollTo({ top: next, behavior: "smooth" });
          setTimeout(run, 600);
        };
        run();
      });
    });

    // 3) One final bottom scroll & pause
    await this.page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
    );
    await new Promise((r) => setTimeout(r, 1_000));

    console.log("[LinkedIn] Thorough scroll complete");
  }

  /** Does pagination bar show a usable “Next” or numbered page? */
  private async hasNextPage(): Promise<boolean> {
    try {
      // Bring pagination into view
      await this.page.evaluate(() => {
        document.querySelector(".artdeco-pagination")?.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
      });
      await new Promise((r) => setTimeout(r, 1_000));

      return this.page.evaluate(() => {
        const nextBtn = document.querySelector<HTMLButtonElement>(
          'button[aria-label="Next"]:not([disabled])'
        );
        if (nextBtn) return true;

        const cur = document.querySelector<HTMLButtonElement>(
          'button[aria-current="true"]'
        );
        if (!cur) return false;

        const curPage = parseInt(cur.textContent?.trim() || "0", 10);
        return !!document.querySelector<HTMLButtonElement>(
          `button[aria-label="Page ${curPage + 1}"]`
        );
      });
    } catch (err) {
      console.error("Error checking for next page:", (err as Error).message);
      return false;
    }
  }

  /** Clicks the “Next” button or numbered page → waits for results to re-render */
  private async navigateToNextPage(currentPage: number): Promise<boolean> {
    console.log(
      `[LinkedIn] Attempting to navigate to page ${currentPage + 1}…`
    );
    try {
      await this.page.evaluate(() => {
        document.querySelector(".artdeco-pagination")?.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
      });
      await new Promise((r) => setTimeout(r, 1_000));

      const clicked = await this.page.evaluate((cur) => {
        const nextBtn = document.querySelector<HTMLButtonElement>(
          'button[aria-label="Next"]:not([disabled])'
        );
        if (nextBtn) {
          nextBtn.click();
          return true;
        }
        const numBtn = document.querySelector<HTMLButtonElement>(
          `button[aria-label="Page ${cur + 1}"]`
        );
        numBtn?.click();
        return !!numBtn;
      }, currentPage);

      if (!clicked) {
        console.error("[LinkedIn] Could not find navigation buttons");
        return false;
      }

      // Wait for page change indicators
      try {
        await this.page.waitForNavigation({
          waitUntil: "networkidle2",
          timeout: 10_000,
        });
      } catch {
        console.log("[LinkedIn] Navigation timeout, continuing…");
      }

      // Either URL or pagination button updates
      try {
        await Promise.race([
          this.page.waitForFunction(
            (next) => location.href.includes(`page=${next}`),
            { timeout: 10_000 },
            currentPage + 1
          ),
          this.page.waitForFunction(
            (cur) => {
              const b = document.querySelector('button[aria-current="true"]');
              return b && parseInt(b.textContent!.trim(), 10) > cur;
            },
            { timeout: 10_000 },
            currentPage
          ),
        ]);
      } catch (err) {
        console.warn(
          "[LinkedIn] Could not confirm page change:",
          (err as Error).message
        );
      }

      await this.page.waitForSelector(
        'div[data-view-name="search-entity-result-universal-template"]',
        { timeout: 30_000 }
      );
      console.log(`[LinkedIn] Now on page ${currentPage + 1}`);
      return true;
    } catch (err) {
      console.error("Error navigating to next page:", (err as Error).message);
      return false;
    }
  }

  /** Extracts up to `max` people cards from the current results page */
  private async scrapeCurrentPage(max: number): Promise<PersonCard[]> {
    return this.page.evaluate((maxCards) => {
      const cards = Array.from(
        document.querySelectorAll<HTMLElement>(
          'div[data-view-name="search-entity-result-universal-template"]'
        )
      );

      const out: PersonCard[] = [];
      for (const card of cards) {
        const link = Array.from(
          card.querySelectorAll<HTMLAnchorElement>('a[href*="/in/"]')
        ).find((a) =>
          a.querySelector('span[aria-hidden="true"]:not(.visually-hidden)')
        );
        if (!link) continue;

        const name =
          link
            .querySelector('span[aria-hidden="true"]:not(.visually-hidden)')!
            .textContent?.trim() || null;

        const profileUrl = link.href || null;

        const country =
          card
            .querySelector<HTMLElement>(
              "div.entity-result__primary-subtitle, span.entity-result__primary-subtitle"
            )
            ?.textContent?.trim() || null;

        const photoUrl =
          card.querySelector<HTMLImageElement>(
            "img.presence-entity__image, img.ivm-view-attr__img--centered"
          )?.src || null;

        out.push({ name, country, photoUrl, profileUrl });
        if (out.length === maxCards) break;
      }
      return out;
    }, max);
  }

  /* ----------  CLEAN-UP ---------- */

  async destroy() {
    try {
      await this.browser?.close();
    } catch {
      /* ignore */
    }
  }
}

export default LinkedInClient;
