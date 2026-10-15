# Hatty’s Build Wizard — Clean v6 beta

A standalone GitHub Pages website. **This is a clean deployment package, not an exact game-verified cap-breaker engine.**

## Important limitations
- The recovered sequential cap-breaker arithmetic is integrated into the experimental optimization path, but archetype `maxWeight` uses 21 visible attributes, not the game's reported 155-slot weight scan. Therefore the calculated gains are **unverified predictions**.
- The site also retains the older manual/reference planning UI for comparison. **Only the button labeled “Optimize Build (experimental)” uses the recovered formula.** The older planner must not be interpreted as the formula engine.
- Build affordability and linked-attribute rules are experimental; results need verification in NBA 2K27.
- “No candidate found” does not prove the requested build is impossible.

## New GitHub repository from an iPhone
1. On GitHub, tap **+ → New repository**. Name it `Hattys-Build-Wizard`, select **Public**, and create it. Keep the old repository unchanged.
2. In the iPhone Files app, extract the ZIP. Upload the **contents** of the extracted folder to the **root** of the new repository, including the `data` folder and its JSON files. Do not upload the ZIP as a single file. Ensure `index.html` appears at the repository root.
3. Commit the files to the `main` branch. If iPhone's GitHub mobile upload flattens the `data` folder, use GitHub's web interface or a desktop browser to preserve the `data/` directory structure.
4. Go to **Settings → Pages → Build and deployment → Deploy from a branch**; select **main** and **/(root)**; Save.
5. Check **Actions** for a successful Pages deployment. Visit `https://itshatty.github.io/Hattys-Build-Wizard/` in a new private tab.
6. Run **Optimize Build (experimental)** and verify the result begins with `Engine: native-breaker-formula-beta-v6`. If you see `reference-scenario estimate`, that is the older separate planning interface, not the experimental optimizer.

## Release validation
Run `node tests/smoke.js` in the extracted folder on a computer with Node.js installed. These tests verify packaging, script wiring and arithmetic invariants, **not exact parity with the game**.

## v7 UI update (no calculation changes)
- Main Optimize button moved below feasibility search; results directly below it, with automatic scrolling when the engine renders output.
- Accuracy information is collapsed at the bottom.
- Rules/data, thresholds and legacy planning controls moved to collapsed Advanced / Developer Settings, accessible from the header gear.
- Physical Feasibility Search remains a separate button, unchanged.
- Current and Projected cap-breaker inputs remain unchanged.
- Manually editing an attribute rating automatically checks its target box.
- Settings are automatically saved to this browser and restored on return. Existing manual Save/Load remain available.
- This is a UI-only update. Formula and game parity remain unverified.

### Updating the existing GitHub Pages repository
Upload/replace `index.html` in the **repository root**. No other existing JS/JSON files need replacing for this UI-only release. If using the complete ZIP instead, upload its *contents*, keeping the `data/` folder and all files at their existing paths. Commit to `main` and wait for GitHub Pages deployment.
