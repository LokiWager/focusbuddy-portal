import { expect, Page } from "@playwright/test";
import { FocusSessionType } from "../../common/api/api";

export class PopupPage {
  constructor(
    private page: Page,
    private extensionId: string,
  ) {}

  async goto() {
    await this.page.goto(`chrome-extension://${this.extensionId}/popup.html`);
  }

  async login() {
    const response = await fetch(
      `${process.env.WXT_API_BASE_URI!}/user/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: "",
        }),
      },
    );
    const data = await response.json();

    // It needs to be in an extension page to use the storage API
    await this.goto();

    await this.page.evaluate(async (data: unknown) => {
      await window.chrome.storage.local.set({
        jwt: data,
      });
    }, data);
  }

  async changeType(type: keyof typeof FocusSessionType) {
    await this.page.getByTestId("focus-type-dropdown").click();
    await this.page.getByRole("menuitem", { name: type }).click();
  }

  async startFocus() {
    await this.page.getByRole("button", { name: "Start Focus" }).click();
    await expect(this.page.getByTestId("countdown-timer")).toBeVisible();
  }

  async endSession() {
    await this.page
      .getByRole("button", { name: "End Current Session" })
      .click();
    await expect(this.page.getByTestId("idle-state-content")).toBeVisible();
  }
}
