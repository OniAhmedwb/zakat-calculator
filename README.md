# 🌙 Zakat Calculator (যাকাত ক্যালকুলেটর)

A modern, production-ready, privacy-first Islamic Zakat Calculator website built exclusively with **static HTML5, CSS3, and vanilla JavaScript**.

Zero server-side dependencies, zero APIs, zero tracking. 100% of calculations execute directly inside the user's browser, designed for deployment on static hosts like **Vercel**, GitHub Pages, or Netlify.

---

## ✨ Key Features

- **100% Client-Side & Privacy-First**: No data typed by the user is ever sent anywhere or stored externally. All calculations run strictly in the browser.
- **Bilingual Support (Bangla 🇧🇩 / English 🇬🇧)**: Complete localization of all labels, placeholders, tooltips, instructions, educational articles, and calculation outputs. Language choice is remembered via safe `localStorage`.
- **Bangla Digits & Currency Formatting**: Automatically converts numbers to Bangla numerals (`০, ১, ২, ...`) when Bangla is active, with Bangladeshi Taka (৳ / BDT) currency formatting and thousand separators.
- **Step 1: Nisab Settings (Fully Configurable)**:
  - Supports both **Gram** and **Tola / Vori** units ($1\text{ tola} = 11.664\text{ g}$).
  - Real-time gold and silver price inputs.
  - Editable Nisab weight standards (Gold: $87.48\text{ g} / 7.5\text{ tola}$; Silver: $612.36\text{ g} / 52.5\text{ tola}$).
  - Nisab standard selector: **Silver (Default & Recommended)** or **Gold**, with live threshold calculation in BDT.
  - Scholarly guidance note regarding mixed wealth standards.
- **Step 2: Zakatable Assets**:
  - Cash in hand
  - Bank balances & Mobile Financial Services (bKash, Nagad, Rocket, Upay)
  - Gold assets with weight, unit, and **purity selection** ($24\text{k}, 22\text{k}, 21\text{k}, 18\text{k}$) calculated using $\frac{\text{karat}}{24}$ purity factor.
  - Silver assets with weight and unit selection.
  - Business inventory and trade merchandise (market value).
  - Recoverable receivables (good debts).
  - Shares, mutual funds, and business investments (zakatable portion).
  - Savings schemes, DPS, and provident funds (accessible portion).
  - Saved rental income & surplus assets.
  - **Dynamic custom asset rows**: Add and delete custom asset items with custom names and amounts.
- **Step 3: Deductible Liabilities**:
  - Immediate debts and unpaid bills.
  - Loan installments due within the upcoming lunar year.
  - Business payables & supplier obligations.
  - **Dynamic custom liability rows**: Add and delete custom debts.
- **Step 4: Final Result & Statement**:
  - High-impact live status banner: **"Zakat is due"** or **"Below nisab, zakat not obligatory"** (`aria-live="polite"`).
  - Visible rate badge: **$2.5\%$ (1/40th)**.
  - Net zakatable wealth ($Assets - Liabilities$).
  - Optional: **"Zakat paid so far this year"** to calculate remaining zakat due.
  - Hawl reminder: Gentle reminder that wealth must be held for one lunar year (~354 days).
  - **Step-by-step mathematical explanation** displaying all steps of the calculation.
  - **Itemized breakdown table** displaying asset shares and percentages.
  - Action buttons:
    - 📋 **Copy result**: Formats and copies a clean statement to clipboard with toast notification.
    - 🖨️ **Print / Save as PDF**: Beautiful print stylesheet formatted for paper and PDF export.
    - 🔄 **Reset All**: Clears inputs back to defaults with confirmation modal.
- **Pre-configured Quick Test Presets**:
  - Sample 1: Silver nisab $612.36\text{ g}$ at $100\text{ BDT/g}$ gives nisab $61,236\text{ BDT}$.
  - Sample 2: Assets $400,000$, liabilities $50,000$, net $350,000$, nisab $61,236$ gives zakat $8,750\text{ BDT}$.
  - Sample 3: Net wealth below nisab shows "not obligatory" with zakat $0\text{ BDT}$.
  - Sample 4: $10\text{ tola } 22\text{k gold}$ at user price is valued using $22/24$ purity.
- **Educational Knowledge Base**:
  - What is Zakat?
  - Who must pay Zakat?
  - How Nisab works.
  - The 8 Quranic Categories of Zakat Recipients (Surah At-Tawbah: 60).
  - 5 Interactive FAQs with smooth accordion expansion.
  - Scholarly consultation disclaimer.
- **Design & Accessibility**:
  - Mobile-first, fully responsive design.
  - Islamic emerald green and clean white calm palette.
  - Dark mode toggle respecting `prefers-color-scheme` with `localStorage` persistence.
  - Keyboard accessible with skip link, focus rings, and screen-reader `aria-live` regions.

---

## 📁 Project Structure

```
├── index.html          # Semantic HTML5 single-page application & SEO meta
├── css/
│   └── style.css       # Responsive CSS, CSS custom properties, Dark mode, Print styles
├── js/
│   └── zakat.js        # Core logic, i18n, live math engine, test presets, print handler
├── favicon.svg         # SVG vector icon (Islamic crescent & balance scale)
├── vercel.json         # Vercel deployment configuration (cleanUrls: true, security headers)
├── sitemap.xml         # SEO XML sitemap
├── robots.txt          # Web crawler configuration
└── README.md           # Documentation
```

---

## 🧮 Mathematical Formulas

### 1. Nisab Threshold
$$\text{Nisab}_{\text{silver}} = \text{Silver Nisab Weight} \times \text{Silver Price}$$
$$\text{Nisab}_{\text{gold}} = \text{Gold Nisab Weight} \times \text{Gold Price}$$

*Defaults:*
- Silver Nisab Weight = $612.36\text{ g}$ ($52.5\text{ tola}$)
- Gold Nisab Weight = $87.48\text{ g}$ ($7.5\text{ tola}$)
- $1\text{ tola / vori} = 11.664\text{ grams}$

### 2. Gold Asset Valuation
$$\text{Gold Value} = \text{Weight in Grams} \times \text{Price per Gram} \times \left(\frac{\text{Karat}}{24}\right)$$
- $24\text{k} = 24 / 24 = 1.0$ ($100\%$)
- $22\text{k} = 22 / 24 \approx 0.9167$ ($91.67\%$)
- $21\text{k} = 21 / 24 = 0.875$ ($87.5\%$)
- $18\text{k} = 18 / 24 = 0.75$ ($75\%$)

### 3. Net Zakatable Wealth & Obligation
$$\text{Net Wealth} = \max(0, \text{Total Assets} - \text{Total Liabilities})$$
$$\text{Zakat Due} = \begin{cases} 
\text{Net Wealth} \times 0.025 & \text{if } \text{Net Wealth} \ge \text{Nisab} \\ 
0 & \text{if } \text{Net Wealth} < \text{Nisab} 
\end{cases}$$
$$\text{Remaining Zakat Due} = \max(0, \text{Zakat Due} - \text{Zakat Paid})$$

---

## 🧪 Verification of Required Test Samples

| Test Case | Description | Input | Expected Output | Status |
|:---:|:---|:---|:---|:---:|
| **Sample 1** | Silver Nisab calculation | Silver $612.36\text{ g}$ @ $100\text{ BDT/g}$ | $\text{Nisab} = 61,236\text{ ৳}$ | ✅ Verified |
| **Sample 2** | Standard Zakat Calculation | Assets $400,000\text{ ৳}$, Liabilities $50,000\text{ ৳}$ ($\text{Net } 350,000\text{ ৳}$, Nisab $61,236\text{ ৳}$) | $\text{Zakat Due} = 8,750\text{ ৳}$ ($350,000 \times 0.025$) | ✅ Verified |
| **Sample 3** | Below Nisab threshold | Assets $45,000\text{ ৳}$, Liabilities $10,000\text{ ৳}$ ($\text{Net } 35,000\text{ ৳}$, Nisab $61,236\text{ ৳}$) | Status: "Not Obligatory", $\text{Zakat} = 0\text{ ৳}$ | ✅ Verified |
| **Sample 4** | 22k Gold Valuation | $10\text{ tola } 22\text{k gold}$ @ $120,000\text{ ৳/tola}$ | Value = $10 \times 120,000 \times \frac{22}{24} = 1,100,000\text{ ৳}$ | ✅ Verified |

*(You can also click the quick sample buttons in the top preset bar to test each case immediately).*

---

## 🚀 How to Run Locally

Because this project is built entirely with vanilla static web technologies:

1. **Directly in Browser**:
   - Double-click `index.html` or drag and drop it into any modern web browser (Chrome, Firefox, Safari, Edge).
   - Everything will work immediately without requiring any web server!

2. **Using a Local Static Server (Optional)**:
   - If using VS Code: Install the **Live Server** extension, right-click `index.html`, and select **Open with Live Server**.
   - Or using Python:
     ```bash
     python -m http.server 3000
     ```
     Then open `http://localhost:3000` in your browser.

---

## 📦 How to Push to GitHub

1. Open your terminal in the project directory:
   ```bash
   git status
   ```
2. Add all files and commit:
   ```bash
   git add .
   git commit -m "feat: complete production-ready Zakat Calculator website"
   ```
3. If connecting to a new repository on GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/zakat-calculator.git
   git branch -M main
   git push -u origin main
   ```

---

## ☁️ How to Deploy on Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository (`zakat-calculator`).
4. In the **Configure Project** settings:
   - **Framework Preset**: Select **"Other"**.
   - **Root Directory**: `./` (leave default).
   - **Build Command**: Leave empty.
   - **Output Directory**: Leave empty.
5. Click **Deploy**.
6. Vercel will instantly publish the static site using the provided `vercel.json` with `cleanUrls: true` and security headers.

---

## 🛡️ Privacy & Compliance

- **Zero Trackers**: No third-party cookies or telemetry.
- **Zero Server Storage**: User financial inputs are processed strictly in browser memory.
- **Safe LocalStorage**: Handled with `try/catch` to ensure seamless operation in private/incognito browsing environments.

---

## ⚖️ Scholarly Disclaimer

This calculator is designed as a technological aid to assist Muslims in calculating their annual zakat. Islamic jurisprudence regarding specific modern financial instruments may vary across schools of thought. Users with nuanced financial assets are encouraged to consult a knowledgeable Islamic scholar.
