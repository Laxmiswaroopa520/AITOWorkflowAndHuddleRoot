/**
 * Presentation for the downloadable Huddle guide, matching the Frontier
 * Accelerator reference export. Kept separate from huddleHtmlStyles so the
 * Role Path and custom learning plan exports keep their existing appearance.
 */
export const huddleGuideStyles = `
    :root {
      --navy: #07144f;
      --blue: #075de8;
      --blue-soft: #edf4ff;
      --green: #07883b;
      --green-soft: #eef9f1;
      --purple: #6127dc;
      --purple-soft: #f3edff;
      --orange: #ff4b16;
      --ink: #0c174d;
      --muted: #40517d;
      --line: #dce2ef;
    }

    * {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      margin: 0;
      background: #e9edf5;
      color: var(--ink);
      font-family: "Segoe UI", Arial, Helvetica, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    button,
    a,
    summary {
      font: inherit;
    }

    svg {
      display: block;
      width: 18px;
      height: 18px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .huddle-page {
      width: min(1180px, calc(100% - 24px));
      min-height: 0;
      margin: 24px auto;
      overflow: hidden;
      background:
        radial-gradient(circle at 50% 22%, rgba(70, 111, 255, 0.04), transparent 30%),
        linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
      border: 1px solid #dfe4ee;
      border-radius: 4px;
      box-shadow: 0 20px 55px rgba(16, 28, 74, 0.12);
      page-break-after: always;
    }

    .huddle-page:last-child {
      page-break-after: auto;
    }

    .page-topbar {
      position: relative;
      height: 88px;
      display: flex;
      align-items: center;
      overflow: hidden;
      padding: 0 34px;
      background: linear-gradient(90deg, #0042a8 0%, #0732a8 43%, #30138c 100%);
      color: #ffffff;
    }

    .brand-left {
      position: relative;
      z-index: 3;
    }

    .microsoft-brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 23px;
      font-weight: 600;
      letter-spacing: -0.03em;
    }

    .ms-grid {
      display: grid;
      width: 25px;
      height: 25px;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 2px;
    }

    .ms-grid i:nth-child(1) { background: #f35325; }
    .ms-grid i:nth-child(2) { background: #81bc06; }
    .ms-grid i:nth-child(3) { background: #05a6f0; }
    .ms-grid i:nth-child(4) { background: #ffba08; }

    .ribbon-art {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .wave {
      position: absolute;
      width: 780px;
      height: 260px;
      right: -70px;
      top: -155px;
      border: 2px solid rgba(161, 91, 255, 0.28);
      border-radius: 50%;
      transform: rotate(-4deg);
    }

    .wave-one {
      box-shadow:
        0 0 0 13px rgba(32, 118, 255, 0.09),
        0 0 0 28px rgba(137, 44, 255, 0.08),
        0 0 0 44px rgba(226, 0, 255, 0.06);
    }

    .wave-two {
      top: -130px;
      right: -120px;
      transform: rotate(4deg);
      box-shadow:
        0 0 0 10px rgba(56, 162, 255, 0.08),
        0 0 0 25px rgba(96, 0, 230, 0.08);
    }

    .wave-three {
      top: -185px;
      right: 30px;
      box-shadow: 0 0 42px rgba(194, 0, 255, 0.35);
    }

    .page-content {
      padding: 46px 38px 30px;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.85fr);
      gap: 36px;
      align-items: start;
    }

    .hero-copy h1 {
      max-width: 720px;
      margin: 0 0 10px;
      color: #08134b;
      font-size: clamp(38px, 5vw, 54px);
      line-height: 1.03;
      letter-spacing: -0.045em;
    }

    .hero-description {
      max-width: 680px;
      margin: 0 0 28px;
      color: #3e4f7a;
      font-size: 17px;
      line-height: 1.55;
    }

    .required-label {
      display: inline-flex;
      margin-bottom: 10px;
      padding: 5px 10px;
      border: 1px solid #bfe0c7;
      border-radius: 999px;
      background: #eef9f1;
      color: #087a37;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .meta-strip {
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      min-width: 0;
      align-items: center;
      gap: 12px;
    }

    .meta-item > span:last-child {
      display: flex;
      min-width: 0;
      flex-direction: column;
      gap: 2px;
    }

    .meta-item small {
      color: #26396d;
      font-size: 13px;
    }

    .meta-item strong {
      display: block;
      max-width: 260px;
      color: #08134b;
      font-size: 14px;
      line-height: 1.4;
      word-break: break-word;
    }

    .meta-divider {
      width: 1px;
      height: 52px;
      background: #d7ddea;
    }

    .round-icon,
    .objective-icon {
      display: grid;
      flex: 0 0 auto;
      place-items: center;
      border-radius: 50%;
      background: var(--blue-soft);
      color: var(--blue);
      font-weight: 800;
    }

    .round-icon {
      width: 50px;
      height: 50px;
    }

    .objective-icon {
      width: 58px;
      height: 58px;
      font-size: 22px;
    }

    .objective-card {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      width: 100%;
      padding: 20px 22px;
      border: 1px solid #dfe3ec;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.96);
      box-shadow: 0 6px 20px rgba(23, 43, 99, 0.07);
    }

    .objective-card h2 {
      margin: 0 0 8px;
      color: #0b53dc;
      font-size: 17px;
    }

    .objective-card p {
      margin: 0;
      color: #142154;
      font-size: 14px;
      line-height: 1.6;
    }

    .card {
      border: 1px solid #e0e4ec;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.97);
      box-shadow: 0 5px 18px rgba(21, 42, 91, 0.06);
    }

    .section-heading,
    .tool-card-title,
    .bottom-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-heading h2,
    .tool-card-title h2,
    .bottom-title h2 {
      margin: 0;
      font-size: 17px;
    }

    .sparkle-icon,
    .tool-card-title > span {
      color: #1534cc;
      font-size: 24px;
    }

    .three-column-summary {
      display: grid;
      grid-template-columns: 1fr auto 1fr auto 1fr;
      gap: 22px;
      margin-top: 30px;
      padding: 26px 28px;
    }

    .summary-column {
      display: flex;
      min-width: 0;
      gap: 16px;
    }

    .summary-icon {
      width: 52px;
      height: 52px;
      display: grid;
      flex: 0 0 auto;
      place-items: center;
      border-radius: 50%;
      font-weight: 800;
    }

    .summary-icon.blue { background: var(--blue-soft); color: var(--blue); }
    .summary-icon.green { background: var(--green-soft); color: var(--green); }
    .summary-icon.purple { background: var(--purple-soft); color: var(--purple); }

    .summary-column h3 {
      margin: 0 0 8px;
      color: var(--blue);
      font-size: 15px;
    }

    .summary-column strong {
      display: block;
      margin-bottom: 6px;
      font-size: 14px;
      line-height: 1.45;
    }

    .summary-column p {
      margin: 0;
      color: #24345f;
      font-size: 13px;
      line-height: 1.62;
    }

    .vertical-rule,
    .tool-divider,
    .required-detail-divider {
      width: 1px;
      background: #dfe3eb;
    }

    .prompt-card,
    .guide-card,
    .steps-card,
    .tool-card,
    .required-detail-card {
      margin-top: 20px;
      padding: 22px 24px;
    }

    .prompt-content {
      position: relative;
      margin-top: 14px;
      padding: 18px 66px 18px 18px;
      border-radius: 10px;
      background: #111111;
      color: #ffffff;
    }

    .prompt-scroll {
      max-height: 150px;
      overflow-y: auto;
      padding-right: 8px;
      font-size: 14px;
      line-height: 1.7;
      white-space: pre-wrap;
    }

    .copy-button {
      display: inline-grid;
      width: 38px;
      height: 38px;
      place-items: center;
      border: 0;
      border-radius: 8px;
      background: #242424;
      color: #ffffff;
      cursor: pointer;
      transition: 160ms ease;
    }

    .copy-button:hover {
      background: #353535;
      transform: translateY(-1px);
    }

    .prompt-content > .copy-button {
      position: absolute;
      top: 14px;
      right: 14px;
    }

    .split-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .question-list,
    .numbered-steps {
      display: grid;
      gap: 10px;
      margin: 20px 0 0;
      padding: 0;
      list-style: none;
    }

    .question-list li {
      position: relative;
      padding-left: 20px;
      color: #15245a;
      font-size: 13.5px;
      line-height: 1.5;
    }

    .question-list li::before {
      position: absolute;
      left: 2px;
      top: 0.46em;
      width: 6px;
      height: 6px;
      border: 1.5px solid var(--blue);
      border-radius: 50%;
      content: "";
    }

    .numbered-steps li {
      display: grid;
      grid-template-columns: 24px 1fr;
      gap: 10px;
      align-items: start;
    }

    .numbered-steps li > span {
      width: 24px;
      height: 24px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--blue);
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
    }

    .numbered-steps p {
      margin: 2px 0 0;
      color: #17275b;
      font-size: 13px;
      line-height: 1.5;
    }

    .tool-card {
      background: linear-gradient(90deg, #fffdf8, #fffdfa);
    }

    .tool-card-title {
      margin-bottom: 20px;
    }

    .tool-grid {
      display: grid;
      grid-template-columns: 1.05fr auto 1fr auto 1fr auto 1fr;
      gap: 16px;
      align-items: stretch;
    }

    .tool-brand,
    .tool-info,
    .required-detail-column {
      display: flex;
      min-width: 0;
      gap: 12px;
    }

    .tool-brand {
      align-items: center;
    }

    .tool-brand > div {
      display: flex;
      min-width: 0;
      flex-direction: column;
      gap: 4px;
    }

    .tool-brand strong {
      overflow: hidden;
      font-size: 16px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tool-brand span {
      color: #31416d;
      font-size: 12px;
    }

    .agent-logo,
    .tool-brand .copilot-mark {
      width: 58px;
      height: 58px;
      flex: 0 0 auto;
      object-fit: contain;
    }

    .copilot-mark {
      position: relative;
      display: inline-block;
      width: 46px;
      height: 46px;
      flex: 0 0 auto;
      filter: drop-shadow(0 4px 8px rgba(14, 3, 70, 0.18));
    }

    .copilot-loop {
      position: absolute;
      inset: 7px;
      border: 8px solid transparent;
      border-radius: 45% 55% 45% 55%;
    }

    .copilot-loop-a {
      border-top-color: #0cb6f4;
      border-right-color: #7047eb;
      border-bottom-color: #bd2bf4;
      transform: rotate(25deg);
    }

    .copilot-loop-b {
      inset: 12px 4px 4px 12px;
      border-top-color: #0acb9a;
      border-left-color: #18a9ef;
      border-bottom-color: #6d43ee;
      transform: rotate(-28deg);
    }

    .mini-icon {
      width: 34px;
      height: 34px;
      display: grid;
      flex: 0 0 auto;
      place-items: center;
      border-radius: 50%;
      font-weight: 700;
    }

    .mini-icon.green { background: var(--green-soft); color: var(--green); }
    .mini-icon.purple { background: var(--purple-soft); color: var(--purple); }

    .tool-info h3,
    .required-detail-column h3 {
      margin: 0 0 6px;
      color: var(--green);
      font-size: 13px;
    }

    .tool-info:last-child h3,
    .required-detail-column:last-child h3 {
      color: var(--purple);
    }

    .tool-info p,
    .required-detail-column p {
      margin: 0;
      color: #263660;
      font-size: 11.8px;
      line-height: 1.62;
    }

    .benefit-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 16px;
      margin: 16px 0 0;
      padding: 13px 0 0;
      border-top: 1px solid #ece9df;
      list-style: none;
    }

    .benefit-strip li {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #344368;
      font-size: 11.5px;
    }

    .check-dot {
      color: var(--green);
      font-weight: 800;
    }


    /* Segmented workflow Huddle */
    .huddle-section-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      padding: 18px 34px;
      border-bottom: 1px solid #dce2ef;
      background: rgba(255, 255, 255, 0.98);
    }

    .huddle-section-tabs {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px;
      border-radius: 14px;
      background: #f0f3f8;
    }

    .huddle-section-tab {
      border: 0;
      border-radius: 11px;
      padding: 11px 17px;
      background: transparent;
      color: #3d507e;
      cursor: pointer;
      font-size: 13px;
      font-weight: 700;
      transition: 160ms ease;
    }

    .huddle-section-tab:hover {
      background: #ffffff;
      color: var(--blue);
    }

    .huddle-section-tab.is-active {
      background: var(--blue);
      color: #ffffff;
      box-shadow: 0 7px 16px rgba(7, 93, 232, 0.22);
    }

    .huddle-section-status {
      min-width: 138px;
      text-align: right;
    }

    .huddle-section-status small {
      display: block;
      margin-bottom: 5px;
      color: #506087;
      font-size: 11px;
    }

    .huddle-section-status strong {
      color: #07144f;
      font-size: 13px;
    }

    .huddle-section-panel {
      display: none;
      min-height: 680px;
    }

    .huddle-section-panel.is-active {
      display: block;
      animation: section-enter 180ms ease;
    }

    @keyframes section-enter {
      from {
        opacity: 0;
        transform: translateY(6px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .business-workflow-card {
      padding: 28px 26px;
    }

    .business-workflow-heading {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 24px;
    }

    .business-workflow-heading h2 {
      margin: 0 0 7px;
      color: #07144f;
      font-size: 20px;
    }

    .business-workflow-heading p {
      margin: 0;
      color: #40517d;
      font-size: 13px;
      line-height: 1.55;
    }

    .workflow-stage-grid {
      display: grid;
      grid-template-columns: repeat(var(--workflow-count), minmax(0, 1fr));
      gap: 14px;
    }

    .workflow-stage-card {
      position: relative;
      min-width: 0;
      min-height: 250px;
      padding: 20px;
      border: 1px solid #d8e1f1;
      border-radius: 13px;
      background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);
    }

    .workflow-stage-card:not(:last-child)::after {
      position: absolute;
      top: 50%;
      right: -16px;
      z-index: 2;
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      border: 1px solid #d8e1f1;
      border-radius: 50%;
      background: #ffffff;
      color: var(--blue);
      content: "›";
      font-size: 20px;
      font-weight: 700;
      transform: translateY(-50%);
    }

    .workflow-stage-number {
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--blue-soft);
      color: var(--blue);
      font-size: 12px;
      font-weight: 800;
    }

    .workflow-stage-card h3 {
      margin: 18px 0 8px;
      color: #07144f;
      font-size: 15px;
      line-height: 1.45;
    }

    .workflow-stage-card p {
      margin: 0;
      color: #40517d;
      font-size: 12.5px;
      line-height: 1.65;
    }

    .workflow-stage-outcome {
      margin-top: 16px;
      padding-top: 13px;
      border-top: 1px solid #e2e7f1;
    }

    .workflow-stage-outcome strong {
      display: block;
      margin-bottom: 4px;
      color: var(--green);
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .workflow-stage-outcome span {
      color: #263660;
      font-size: 11.5px;
      line-height: 1.5;
    }

    .huddle-section-actions {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 0 38px 32px;
    }

    .section-action-button {
      min-width: 96px;
      padding: 11px 16px;
      border: 1px solid #cdd8ea;
      border-radius: 10px;
      background: #ffffff;
      color: var(--blue);
      cursor: pointer;
      font-size: 13px;
      font-weight: 700;
    }

    .section-next {
      margin-left: auto;
      border-color: var(--blue);
      background: var(--blue);
      color: #ffffff;
    }

    .section-action-button:disabled {
      opacity: 0.42;
      cursor: not-allowed;
    }

    .facilitator-notes-card {
      margin-top: 20px;
      padding: 24px;
    }

    .facilitator-notes-intro {
      margin: 10px 0 16px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.6;
    }

    .facilitator-notes-content {
      min-height: 180px;
      padding: 18px 20px;
      border: 1px solid #dce3f0;
      border-radius: 12px;
      background: #fbfcff;
      color: #17275b;
      font-size: 14px;
      line-height: 1.75;
      white-space: pre-wrap;
    }

    /* Required Huddle accordion */
    .required-scenarios-shell {
      margin-top: 28px;
      padding: 24px;
    }

    .required-section-heading {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
      padding-bottom: 18px;
      border-bottom: 1px solid #e5e9f2;
    }

    .required-section-kicker {
      display: block;
      margin-bottom: 5px;
      color: var(--green);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.11em;
      text-transform: uppercase;
    }

    .required-section-heading h2 {
      margin: 0 0 6px;
      font-size: 19px;
    }

    .required-section-heading p {
      margin: 0;
      color: var(--muted);
      font-size: 12.5px;
    }

    .scenario-count {
      flex: 0 0 auto;
      padding: 7px 11px;
      border-radius: 999px;
      background: var(--blue-soft);
      color: var(--blue);
      font-size: 11px;
      font-weight: 700;
    }

    .workflow-filter-shell {
      margin-top: 18px;
      padding: 16px;
      border: 1px solid #dce3f0;
      border-radius: 12px;
      background: #f8faff;
    }

    .workflow-filter-label {
      margin-bottom: 11px;
      color: #29416f;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .workflow-filter-buttons {
      display: grid;
      grid-template-columns: repeat(
        min(5, var(--workflow-filter-count, 5)),
        minmax(0, 1fr)
      );
      gap: 9px;
    }

    .workflow-filter-button {
      display: grid;
      grid-template-columns: 28px minmax(0, 1fr);
      grid-template-rows: auto auto;
      gap: 2px 9px;
      align-items: center;
      min-width: 0;
      padding: 11px 12px;
      border: 1px solid #d5deed;
      border-radius: 10px;
      background: #ffffff;
      color: #20345f;
      cursor: pointer;
      text-align: left;
      transition: 160ms ease;
    }

    .workflow-filter-button > span {
      width: 28px;
      height: 28px;
      display: grid;
      grid-row: 1 / 3;
      place-items: center;
      border-radius: 50%;
      background: var(--blue-soft);
      color: var(--blue);
      font-size: 11px;
      font-weight: 800;
    }

    .workflow-filter-button strong {
      overflow: hidden;
      color: #0b174d;
      font-size: 11.5px;
      line-height: 1.3;
      text-overflow: ellipsis;
    }

    .workflow-filter-button small {
      color: #657394;
      font-size: 10px;
    }

    .workflow-filter-button:hover:not(:disabled) {
      border-color: rgba(7, 93, 232, 0.55);
      background: #f5f9ff;
    }

    .workflow-filter-button.is-active {
      border-color: var(--blue);
      background: var(--blue);
      box-shadow: 0 6px 16px rgba(7, 93, 232, 0.18);
    }

    .workflow-filter-button.is-active strong,
    .workflow-filter-button.is-active small {
      color: #ffffff;
    }

    .workflow-filter-button.is-active > span {
      background: rgba(255, 255, 255, 0.18);
      color: #ffffff;
    }

    .workflow-filter-button:disabled {
      cursor: not-allowed;
      opacity: 0.42;
    }

    .workflow-filter-empty {
      margin-top: 14px;
      padding: 22px;
      border: 1px dashed #cbd5e5;
      border-radius: 10px;
      color: var(--muted);
      font-size: 13px;
      text-align: center;
    }

    .required-scenario-stack {
      display: grid;
      gap: 12px;
      margin-top: 18px;
    }

    .required-scenario-card {
      overflow: hidden;
      border: 1px solid #dce3f0;
      border-radius: 12px;
      background: #ffffff;
      box-shadow: 0 3px 12px rgba(23, 43, 99, 0.045);
    }

    .required-scenario-card[open] {
      border-color: rgba(7, 93, 232, 0.34);
      box-shadow: 0 8px 24px rgba(7, 93, 232, 0.09);
    }

    .required-scenario-summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      padding: 17px 18px;
      cursor: pointer;
      list-style: none;
      user-select: none;
    }

    .required-scenario-summary::-webkit-details-marker {
      display: none;
    }

    .scenario-leading {
      display: flex;
      min-width: 0;
      align-items: flex-start;
      gap: 14px;
    }

    .scenario-number {
      width: 32px;
      height: 32px;
      display: grid;
      flex: 0 0 auto;
      place-items: center;
      border-radius: 50%;
      background: var(--blue-soft);
      color: var(--blue);
      font-size: 12px;
      font-weight: 800;
    }

    .required-scenario-card[open] .scenario-number {
      background: var(--blue);
      color: #ffffff;
    }

    .scenario-copy {
      min-width: 0;
    }

    .scenario-copy h3 {
      margin: 0 0 5px;
      color: #0b174d;
      font-size: 14px;
      line-height: 1.45;
    }

    .scenario-copy p {
      margin: 0;
      color: #536186;
      font-size: 12.5px;
      line-height: 1.55;
    }

   .scenario-chevron {
  width: 36px;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #f3f6fb;

  color: #4b5f88;

  transition: all .25s ease;

  flex-shrink: 0;
}

.required-scenario-summary:hover .scenario-chevron{
    background:#e8f0ff;
    color:#0F6CBD;
}

.required-scenario-card[open] .scenario-chevron{
    transform:rotate(180deg);
    background:#0F6CBD;
    color:white;
}

.scenario-chevron svg{
    width:16px;
    height:16px;
}

    .required-scenario-expanded {
      padding: 0 18px 18px 64px;
      border-top: 1px solid #edf0f6;
      background: #fbfcff;
    }

    .prompt-label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 0 10px;
    }

    .prompt-agent-action {
      display: flex;
      min-width: 0;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .launch-agent-button {
      display: inline-flex;
      flex: 0 0 auto;
      align-items: center;
      justify-content: center;
      padding: 7px 12px;
      border-radius: 8px;
      background: var(--blue);
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      line-height: 1.2;
      text-decoration: none;
      transition: 160ms ease;
    }

    .launch-agent-button:hover {
      background: #064fc4;
      box-shadow: 0 5px 12px rgba(7, 93, 232, 0.18);
      transform: translateY(-1px);
    }

    .prompt-label {
      color: #29416f;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .scenario-copy-button {
      width: 34px;
      height: 34px;
    }

    .scenario-prompt-scroll {
      height: 138px;
      overflow-y: auto;
      padding: 15px 16px;
      border: 1px solid #2d2d2d;
      border-radius: 10px;
      background: #111111;
      color: #ffffff;
      font-size: 13px;
      line-height: 1.68;
      white-space: pre-wrap;
      scrollbar-color: #666 #1a1a1a;
      scrollbar-width: thin;
    }

    .scenario-prompt-scroll::-webkit-scrollbar {
      width: 8px;
    }

    .scenario-prompt-scroll::-webkit-scrollbar-track {
      background: #1a1a1a;
      border-radius: 999px;
    }

    .scenario-prompt-scroll::-webkit-scrollbar-thumb {
      background: #666666;
      border-radius: 999px;
    }

    .required-detail-grid {
      display: grid;
      grid-template-columns: 1fr auto 1fr auto 1fr;
      gap: 18px;
      align-items: stretch;
      margin-top: 16px;
    }

    .empty-state {
      padding: 24px;
      border: 1px dashed #ccd5e5;
      border-radius: 12px;
      color: var(--muted);
      text-align: center;
    }

    .bottom-grid {
      display: grid;
      grid-template-columns: 1.08fr 1fr 1.08fr;
      gap: 20px;
      margin-top: 20px;
    }

    .resources-card,
    .reflection-card,
    .commit-card {
      min-width: 0;
      padding: 20px 22px;
    }

    .bottom-title {
      margin-bottom: 16px;
    }

    .blue-title { color: var(--blue); }
    .green-title { color: var(--green); }
    .orange-title { color: var(--orange); }

    .resources-card ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .resource-row > a,
    .resource-row > span {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 9px 0;
      border-bottom: 1px solid #dfe4ef;
      color: var(--blue);
      text-decoration: none;
    }

    .resource-row:last-child > a,
    .resource-row:last-child > span {
      border-bottom: 0;
    }

    .resource-copy strong {
      display: block;
      font-size: 12px;
      font-weight: 600;
    }

    .resource-copy small {
      display: block;
      margin-top: 3px;
      color: var(--muted);
      font-size: 10.5px;
      line-height: 1.4;
    }

    .reflection-card h3,
    .commit-card h3 {
      margin: 0 0 10px;
      font-size: 14px;
    }

    .reflection-card p,
    .commit-card p {
      margin: 0;
      color: #33416a;
      font-size: 12.5px;
      line-height: 1.65;
    }

    .page-footer {
      position: relative;
      display: flex;
      justify-content: center;
      margin-top: 26px;
    }

    .generated-badge {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 6px 17px;
      border: 1px solid #e3e6ed;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.92);
      color: #30416d;
      box-shadow: 0 4px 18px rgba(30, 48, 94, 0.055);
      font-size: 11px;
    }

    .generated-badge .copilot-mark {
      width: 24px;
      height: 24px;
      filter: none;
    }

    .generated-badge .copilot-loop {
      inset: 4px;
      border-width: 4px;
    }

    .generated-badge .copilot-loop-b {
      inset: 7px 2px 2px 7px;
    }

    .generated-badge i {
      width: 1px;
      height: 20px;
      background: #dfe3eb;
    }

    .page-number {
      position: absolute;
      right: 4px;
      bottom: 5px;
      color: #78829c;
      font-size: 11px;
    }

    .toast {
      position: fixed;
      right: 22px;
      bottom: 22px;
      z-index: 20;
      padding: 11px 16px;
      border-radius: 8px;
      background: #07144f;
      color: #ffffff;
      box-shadow: 0 10px 28px rgba(7, 20, 79, 0.3);
      font-size: 13px;
      opacity: 0;
      transform: translateY(8px);
      transition: 180ms ease;
      pointer-events: none;
    }

    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }

    /* Workflow Huddle redesign */
    .workflow-huddle-page .huddle-section-nav {
      align-items: flex-start;
    }

    .workflow-huddle-page .huddle-section-tabs {
      flex-wrap: wrap;
    }

    .workflow-huddle-page .huddle-section-tab {
      padding: 10px 13px;
      font-size: 12px;
    }

    .overview-two-column,
    .stage-content-grid,
    .activity-practice-grid,
    .activity-output-grid,
    .commit-layout {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
      margin-top: 24px;
    }

    .overview-summary-card,
    .activity-preview-card,
    .huddle-flow-card,
    .stage-shell,
    .tool-section-intro,
    .resources-tab-card,
    .facilitator-guidance-summary {
      padding: 24px;
    }

    .overview-summary-card > p,
    .resources-intro,
    .tool-section-intro > p {
      margin: 14px 0 0;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.65;
    }

    .overview-outcome {
      margin-top: 18px;
      padding-top: 16px;
      border-top: 1px solid var(--line);
    }

    .overview-outcome span,
    .activity-eyebrow,
    .stage-kicker,
    .talk-track-label,
    .tfd-card > span {
      display: block;
      margin-bottom: 6px;
      color: var(--blue);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.09em;
      text-transform: uppercase;
    }

    .overview-outcome strong {
      color: var(--ink);
      font-size: 14px;
      line-height: 1.55;
    }

    .activity-preview-list,
    .practice-activity-stack,
    .multi-tool-stack {
      display: grid;
      gap: 12px;
      margin-top: 16px;
    }

    .activity-preview-row {
      display: grid;
      grid-template-columns: 34px minmax(0, 1fr);
      gap: 12px;
      align-items: start;
      padding: 12px 0;
      border-bottom: 1px solid var(--line);
    }

    .activity-preview-row:last-child {
      border-bottom: 0;
    }

    .activity-preview-row strong {
      display: block;
      color: var(--ink);
      font-size: 13px;
    }

    .activity-preview-row p {
      margin: 4px 0 0;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.5;
    }

    .activity-letter,
    .stage-number,
    .flow-stage-card > span,
    .facilitator-stage-summary-grid > div > span {
      width: 34px;
      height: 34px;
      display: grid;
      flex: 0 0 auto;
      place-items: center;
      border-radius: 50%;
      background: var(--blue);
      color: #ffffff;
      font-size: 12px;
      font-weight: 800;
    }

    .huddle-flow-card {
      margin-top: 24px;
    }

    .three-stage-flow {
      display: grid;
      grid-template-columns: 1fr auto 1fr auto 1fr;
      gap: 14px;
      align-items: stretch;
      margin-top: 20px;
    }

    .flow-stage-card {
      display: flex;
      gap: 14px;
      min-width: 0;
      padding: 18px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: #ffffff;
    }

    .flow-stage-primary {
      border-color: rgba(7, 93, 232, 0.38);
      background: var(--blue-soft);
    }

    .flow-stage-card h3 {
      margin: 0 0 5px;
      color: var(--ink);
      font-size: 14px;
    }

    .flow-stage-card p {
      margin: 0;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.55;
    }

    .flow-arrow {
      display: grid;
      place-items: center;
      color: var(--blue);
      font-size: 20px;
      font-weight: 800;
    }

    .think-feel-do-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      margin-top: 20px;
    }

    .tfd-card {
      padding: 18px;
    }

    .tfd-card p {
      margin: 0;
      color: #24345f;
      font-size: 12.5px;
      line-height: 1.55;
    }

    .stage-header {
      display: flex;
      align-items: flex-start;
      gap: 15px;
    }

    .stage-header > div {
      min-width: 0;
      flex: 1;
    }

    .stage-header h2 {
      margin: 0 0 7px;
      color: var(--ink);
      font-size: 22px;
    }

    .stage-header p {
      margin: 0;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.6;
    }

    .talk-track-callout {
      margin-top: 20px;
      padding: 16px 18px;
      border-left: 4px solid var(--blue);
      border-radius: 8px;
      background: var(--blue-soft);
    }

    .talk-track-callout p {
      margin: 0;
      color: #20345f;
      font-size: 13px;
      line-height: 1.65;
    }

    .stage-content-card,
    .commit-discussion-card,
    .activity-detail-card,
    .activity-output-card {
      padding: 18px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: #ffffff;
    }

    .stage-content-card h3,
    .commit-discussion-card h3,
    .activity-detail-card h3 {
      margin: 0 0 10px;
      color: var(--ink);
      font-size: 14px;
    }

    .check-list {
      display: grid;
      gap: 10px;
      margin: 14px 0 0;
      padding: 0;
      list-style: none;
    }

    .check-list li {
      position: relative;
      padding-left: 22px;
      color: #263660;
      font-size: 13px;
      line-height: 1.5;
    }

    .check-list li::before {
      position: absolute;
      left: 0;
      color: var(--green);
      content: '✓';
      font-weight: 800;
    }

    .practice-activity-card {
      overflow: hidden;
      border: 1px solid #dce3f0;
      border-radius: 12px;
      background: #ffffff;
    }

    .practice-activity-card[open] {
      border-color: rgba(7, 93, 232, 0.4);
      box-shadow: 0 8px 24px rgba(7, 93, 232, 0.08);
    }

    .practice-activity-summary {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 17px 18px;
      cursor: pointer;
      list-style: none;
    }

    .practice-activity-summary::-webkit-details-marker {
      display: none;
    }

    .practice-activity-heading {
      display: block;
      min-width: 0;
      flex: 1;
    }

    .practice-activity-heading strong {
      display: block;
      color: var(--ink);
      font-size: 14px;
    }

    .practice-activity-heading small {
      display: block;
      margin-top: 5px;
      color: var(--muted);
      font-size: 12.5px;
      line-height: 1.55;
    }

    .practice-activity-card[open] .scenario-chevron {
      transform: rotate(180deg);
      background: #0f6cbd;
      color: white;
    }

    .practice-activity-body {
      padding: 0 18px 20px 66px;
      border-top: 1px solid #edf0f6;
      background: #fbfcff;
    }

    .activity-tool-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      padding: 16px 0 4px;
    }

    .activity-tool-row strong {
      color: var(--ink);
      font-size: 13px;
    }

    .activity-prompt-block {
      margin-top: 10px;
    }

    .compact-steps {
      margin-top: 12px;
    }

    .activity-output-grid {
      margin-top: 16px;
    }

    .activity-output-card p {
      margin: 0;
      color: #263660;
      font-size: 12.5px;
      line-height: 1.6;
    }

    .expected-output-card {
      border-left: 4px solid var(--blue);
    }

    .human-checkpoint-card {
      border-left: 4px solid var(--green);
    }

    .nested-card {
      margin: 0;
      box-shadow: none;
    }

    .commit-discussion-card {
      margin-top: 20px;
    }

    .tool-section-intro {
      margin-bottom: 18px;
    }

    .multi-tool-card {
      margin-top: 0;
    }

    .tool-launch-button {
      margin-left: auto;
    }

    .resources-tab-card ul {
      margin-top: 18px;
    }

    .facilitator-stage-summary-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      margin-top: 18px;
    }

    .facilitator-stage-summary-grid > div {
      display: grid;
      grid-template-columns: 34px minmax(0, 1fr);
      gap: 8px 12px;
      align-items: start;
      padding: 16px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: #fbfcff;
    }

    .facilitator-stage-summary-grid strong,
    .facilitator-stage-summary-grid p {
      grid-column: 2;
    }

    .facilitator-stage-summary-grid strong {
      color: var(--ink);
      font-size: 13px;
    }

    .facilitator-stage-summary-grid p {
      margin: 0;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.55;
    }


    .m365-copilot-logo {
      width: 64px;
      height: 64px;
      flex: 0 0 auto;
      object-fit: contain;
      filter: drop-shadow(0 5px 10px rgba(34, 24, 107, 0.16));
    }


    /* Featured vs optional Explore & Practice activities */
    .featured-activities-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-top: 22px;
      padding: 0 2px;
    }

    .featured-activities-header h3 {
      margin: 0;
      color: var(--ink);
      font-size: 15px;
    }

    .featured-activities-header p {
      margin: 4px 0 0;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.5;
    }

    .activity-tier-badge {
      display: inline-flex;
      flex: 0 0 auto;
      align-items: center;
      padding: 6px 10px;
      border-radius: 999px;
      background: var(--blue-soft);
      color: var(--blue);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }

    .practice-activity-card[data-practice-tier="featured"] {
      border-color: rgba(7, 93, 232, 0.34);
    }

    .additional-activities {
      margin-top: 18px;
      overflow: hidden;
      border: 1px solid #dce3f0;
      border-radius: 12px;
      background: #f8faff;
    }

    .additional-activities > summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 16px 18px;
      cursor: pointer;
      list-style: none;
      user-select: none;
    }

    .additional-activities > summary::-webkit-details-marker {
      display: none;
    }

    .additional-activities-copy strong {
      display: block;
      color: var(--ink);
      font-size: 14px;
    }

    .additional-activities-copy small {
      display: block;
      margin-top: 4px;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.5;
    }

    .additional-activities[open] .scenario-chevron {
      transform: rotate(180deg);
      background: #0f6cbd;
      color: #ffffff;
    }

    .optional-activity-stack {
      display: grid;
      gap: 12px;
      padding: 0 18px 18px;
      border-top: 1px solid #e5eaf3;
      background: #ffffff;
    }

    .optional-activity-stack .practice-activity-card {
      margin-top: 14px;
      border-style: dashed;
    }

    .optional-activities-empty {
      margin-top: 14px;
      padding: 16px;
      border: 1px dashed #cbd5e5;
      border-radius: 10px;
      color: var(--muted);
      font-size: 12.5px;
      line-height: 1.55;
      text-align: center;
    }
    @media (max-width: 980px) {
      .overview-two-column,
      .stage-content-grid,
      .activity-practice-grid,
      .activity-output-grid,
      .commit-layout,
      .think-feel-do-grid,
      .facilitator-stage-summary-grid {
        grid-template-columns: 1fr;
      }

      .three-stage-flow {
        grid-template-columns: 1fr;
      }

      .flow-arrow {
        transform: rotate(90deg);
      }

      .practice-activity-body {
        padding-left: 18px;
      }

      .hero-grid,
      .split-grid,
      .bottom-grid,
      .three-column-summary,
      .tool-grid,
      .required-detail-grid {
        grid-template-columns: 1fr;
      }

      .vertical-rule,
      .tool-divider,
      .required-detail-divider {
        width: 100%;
        height: 1px;
      }

      .meta-strip {
        flex-wrap: wrap;
      }

      .meta-divider {
        display: none;
      }
    }

    @media (max-width: 640px) {
      .huddle-page {
        width: 100%;
        min-height: 0;
        margin: 0;
        border: 0;
        border-radius: 0;
      }

      .page-topbar {
        height: 78px;
        padding: 0 20px;
      }

      .page-content {
        padding: 30px 18px 24px;
      }

      .hero-copy h1 {
        font-size: 36px;
      }

      .required-section-heading {
        flex-direction: column;
      }

      .workflow-filter-buttons {
        grid-template-columns: 1fr;
      }

      .required-scenario-expanded {
        padding-left: 18px;
      }

      .scenario-prompt-scroll {
        height: 160px;
      }

      .generated-badge {
        flex-wrap: wrap;
        justify-content: center;
      }
    }


    @media (max-width: 980px) {
      .huddle-section-nav {
        align-items: flex-start;
        flex-direction: column;
      }

      .huddle-section-tabs {
        width: 100%;
        overflow-x: auto;
      }

      .huddle-section-tab {
        flex: 0 0 auto;
      }

      .huddle-section-status {
        text-align: left;
      }

      .workflow-stage-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .workflow-stage-card:not(:last-child)::after {
        display: none;
      }
    }

    @media (max-width: 640px) {
      .huddle-section-nav {
        padding: 14px 18px;
      }

      .workflow-stage-grid {
        grid-template-columns: 1fr;
      }

      .huddle-section-panel {
        min-height: 0;
      }

      .huddle-section-actions {
        padding: 0 18px 24px;
      }
    }

    @media print {
      @page {
        size: A4 portrait;
        margin: 0;
      }

      body {
        background: #ffffff;
      }

      .huddle-page {
        width: 100%;
        min-height: 297mm;
        margin: 0;
        border: 0;
        border-radius: 0;
        box-shadow: none;
      }

      .copy-button,
      .huddle-section-nav,
      .huddle-section-actions,
      .workflow-filter-shell {
        display: none !important;
      }

      .required-scenario-card[hidden] {
        display: block !important;
      }

      .huddle-section-panel {
        display: block !important;
        min-height: 0;
        page-break-inside: avoid;
      }

      .required-scenario-card:not([open]) .required-scenario-expanded {
        display: block;
      }
    }

    /* Frontier Accelerator branding + discussion section */
    .page-topbar {
      justify-content: space-between;
    }

    .frontier-brand,
    .brand-right {
      position: relative;
      z-index: 3;
      display: flex;
      align-items: center;
    }

    .frontier-brand img {
      display: block;
      width: auto;
      height: 66px;
      max-width: 190px;
      object-fit: contain;
    }

    .brand-right .microsoft-brand {
      color: #ffffff;
      font-size: 20px;
    }

    .brand-right .ms-grid {
      width: 23px;
      height: 23px;
    }

    .flow-stage-card[data-flow-target] {
      cursor: pointer;
      transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease, background 160ms ease;
    }

    .flow-stage-card[data-flow-target]:hover {
      border-color: rgba(7, 93, 232, 0.5);
      background: #f8fbff;
      box-shadow: 0 8px 20px rgba(7, 93, 232, 0.08);
      transform: translateY(-2px);
    }

    .flow-stage-card[data-flow-target]:focus-visible {
      outline: 3px solid rgba(7, 93, 232, 0.24);
      outline-offset: 2px;
    }

    .best-practices-shell {
      padding: 28px;
    }

    .best-practices-intro {
      max-width: 900px;
      margin: 10px 0 0;
      color: var(--muted);
      font-size: 13.5px;
      line-height: 1.65;
    }

    .discussion-cue {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-top: 20px;
      padding: 14px 16px;
      border: 1px solid #cfe0ff;
      border-radius: 11px;
      background: #f5f9ff;
      color: #20345f;
      font-size: 12.5px;
      line-height: 1.55;
    }

    .discussion-cue strong {
      color: var(--blue);
    }

    .discussion-question-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      margin-top: 20px;
    }

    .discussion-question-card {
      display: grid;
      grid-template-columns: 36px minmax(0, 1fr);
      gap: 12px;
      align-items: start;
      min-height: 104px;
      padding: 17px 18px;
      border: 1px solid #dce3f0;
      border-radius: 12px;
      background: #ffffff;
      box-shadow: 0 3px 12px rgba(23, 43, 99, 0.04);
    }

    .discussion-question-card > span {
      width: 36px;
      height: 36px;
      display: grid;
      place-items: center;
      border-radius: 10px;
      background: var(--blue-soft);
      color: var(--blue);
      font-size: 12px;
      font-weight: 800;
    }

    .discussion-question-card strong {
      display: block;
      margin-bottom: 5px;
      color: var(--ink);
      font-size: 13.5px;
      line-height: 1.4;
    }

    .discussion-question-card p {
      margin: 0;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.55;
    }

    @media (max-width: 760px) {
      .frontier-brand img {
        height: 54px;
        max-width: 155px;
      }

      .brand-right .microsoft-brand > span:last-child {
        display: none;
      }

      .discussion-question-grid {
        grid-template-columns: 1fr;
      }
    }

  

    /* 2026-08-17 Huddle overview and stage refinements */
    .tfd-section-heading {
      margin: 26px 0 12px;
    }

    .tfd-section-heading h2 {
      margin: 0;
      color: var(--ink);
      font-size: 17px;
      line-height: 1.4;
    }

    .huddle-agenda-card {
      margin-top: 24px;
      padding: 22px 24px;
    }

    .agenda-intro {
      margin: 10px 0 0;
      color: var(--muted);
      font-size: 12.5px;
      line-height: 1.55;
    }

    .agenda-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin-top: 18px;
    }

    .agenda-item {
      display: grid;
      grid-template-columns: 34px minmax(0, 1fr);
      gap: 10px;
      align-items: center;
      min-width: 0;
      padding: 13px 14px;
      border: 1px solid var(--line);
      border-radius: 11px;
      background: #fbfcff;
    }

    .agenda-item > span {
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--blue-soft);
      color: var(--blue);
      font-size: 11px;
      font-weight: 800;
    }

    .agenda-item strong,
    .agenda-item small {
      display: block;
    }

    .agenda-item strong {
      color: var(--ink);
      font-size: 12px;
      line-height: 1.35;
    }

    .agenda-item small {
      margin-top: 3px;
      color: var(--blue);
      font-size: 11px;
      font-weight: 700;
    }

    .overview-next-note {
      margin-top: 24px;
      padding: 14px 16px;
      border: 1px solid #d7e3f7;
      border-radius: 10px;
      background: #f8fbff;
      color: #33466f;
      font-size: 12.5px;
      line-height: 1.55;
    }

    .overview-next-note strong {
      color: var(--ink);
    }

    .stage-topic-context {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--line);
    }

    .stage-topic-context span {
      flex: 0 0 auto;
      padding: 5px 8px;
      border-radius: 999px;
      background: var(--blue-soft);
      color: var(--blue);
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
    }

    .stage-topic-context strong {
      color: var(--ink);
      font-size: 14px;
      line-height: 1.4;
    }

    @media (max-width: 980px) {
      .agenda-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 640px) {
      .agenda-grid {
        grid-template-columns: 1fr;
      }
      .stage-topic-context {
        align-items: flex-start;
        flex-direction: column;
      }
    }


    /* Compact Huddle timing band */
    .overview-timing-band {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: -18px 0 28px;
      padding: 12px 16px;
      border: 1px solid #dce5f3;
      border-radius: 12px;
      background: linear-gradient(90deg, #f8fbff 0%, #ffffff 100%);
      box-shadow: 0 3px 12px rgba(23, 43, 99, 0.04);
    }

    .overview-timing-title {
      flex: 0 0 auto;
      padding: 6px 11px;
      border-radius: 999px;
      background: var(--blue-soft);
      color: var(--blue);
      font-size: 11px;
      font-weight: 800;
      white-space: nowrap;
    }

    .overview-timing-steps {
      display: flex;
      min-width: 0;
      flex: 1;
      align-items: center;
      justify-content: flex-start;
      gap: 10px;
      color: #41527c;
      font-size: 11.5px;
    }

    .overview-timing-step {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      white-space: nowrap;
    }

    .overview-timing-step strong {
      color: var(--ink);
      font-weight: 700;
    }

    .overview-timing-step span {
      color: var(--blue);
      font-weight: 800;
    }

    .overview-timing-arrow {
      flex: 0 0 auto;
      color: #8ba1c7;
      font-weight: 700;
    }

    /* Participant-facing transition into Share Your Experience */
    .overview-next-note {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-top: 24px;
      padding: 16px 18px;
      border: 1px solid #d7e3f7;
      border-radius: 12px;
      background: linear-gradient(90deg, #f8fbff 0%, #ffffff 100%);
      color: #33466f;
      font-size: 12.5px;
      line-height: 1.55;
    }

    .overview-next-note .transition-kicker {
      flex: 0 0 auto;
      padding: 5px 9px;
      border-radius: 999px;
      background: var(--blue-soft);
      color: var(--blue);
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .overview-next-note strong {
      display: block;
      margin-bottom: 2px;
      color: var(--ink);
      font-size: 13px;
    }

    .overview-next-note span:last-child {
      display: block;
    }

    @media (max-width: 980px) {
      .overview-timing-band {
        align-items: flex-start;
        flex-direction: column;
      }

      .overview-timing-steps {
        width: 100%;
        justify-content: flex-start;
        flex-wrap: wrap;
      }
    }

    @media (max-width: 640px) {
      .overview-timing-band {
        margin-top: -8px;
      }

      .overview-timing-arrow {
        display: none;
      }

      .overview-timing-step {
        width: calc(50% - 5px);
      }

      .overview-next-note {
        align-items: flex-start;
        flex-direction: column;
      }
    }

`;
