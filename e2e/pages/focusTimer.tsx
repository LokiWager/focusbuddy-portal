import { Page } from "@playwright/test";

export class FocusTimerPage {
  constructor(
    private page: Page,
    private extensionId: string,
  ) {}

  async goto() {
    await this.page.goto(
      `chrome-extension://${this.extensionId}/dashboard.html#/Focustimer`,
    );
  }

  async addSession(
    duration: number,
    breakDuration: number,
    startDate: string,
    startTimeHr: string,
    startTimeMin: string,
  ) {
    await this.page.getByTestId("add-session-button").click();
    await this.page.getByTestId("start-date").fill(startDate);
    await this.page.selectOption("select:nth-of-type(1)", startTimeHr);
    await this.page.selectOption("select:nth-of-type(2)", startTimeMin);
    await this.page.getByTestId("duration-input").fill(duration.toString());
    await this.page
      .getByTestId("break-duration-input")
      .fill(breakDuration.toString());
    await this.page.getByTestId("confirm-add-session-button").click();
  }

  get focusSchedule() {
    return this.page.getByTestId("focus-schedule");
  }
}
