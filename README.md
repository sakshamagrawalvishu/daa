# Allocare — Smart Resource Allocation System

A complete, client-side DAA mini project that demonstrates resource selection under a fixed budget using:
- **Greedy heuristic:** sorts by value-to-cost ratio and selects resources that fit.
- **Dynamic Programming:** solves the 0/1 Knapsack problem for an optimal selection.

## Run the project
1. Download and extract `smart_resource_allocation_system.zip`.
2. Open `index.html` in a modern browser (Chrome, Edge, Firefox).
3. Click **Load sample data**, then **Run optimization**.
4. Edit resource names, costs, values, or the budget and run again.
5. Use **Export results CSV** to download the current comparison.

No installation, internet connection, server, or database is required.

## Files
- `index.html` — interface and page structure.
- `styles.css` — responsive styling.
- `script.js` — resource management, algorithms, comparison, and CSV export.
- `PROJECT_REPORT.md` — project report draft for academic submission.

## Input model
Each resource has:
- `cost`: integer resource cost (₹).
- `value`: non-negative integer priority/value score.
- `budget`: maximum total cost allowed.

Each resource can be selected at most once, so the optimization problem is **0/1 Knapsack**.

## Algorithm notes and limitations
- Greedy sorts by value/cost ratio in `O(n log n)` time. For 0/1 Knapsack it is a heuristic and is not guaranteed to be optimal.
- Dynamic Programming uses the recurrence `DP[i][b] = max(DP[i-1][b], DP[i-1][b-w_i] + v_i)` when `w_i <= b`; otherwise it carries forward `DP[i-1][b]`.
- The demo scales costs into capacity units and rounds each resource weight up. This guarantees the selected items remain within the real budget, but **can exclude a feasible combination**, so the DP result is optimal for the scaled instance rather than mathematically exact for every rupee-denominated input. The scale is selected to keep the table manageable in a browser.
- Measured runtime is illustrative and varies by machine and browser. Operation counts are useful for repeatable comparison, but the DP counter counts table-cell evaluations, not only comparisons between item values.
- This is an educational demo, not a financial recommendation engine.

## Suggested extensions
- Exact DP using a user-selected unit size (e.g. ₹100 or ₹500), with a visible warning about rounding.
- CSV import of resources.
- Add item categories and mandatory/excluded items.
- Compare more algorithms or add charts over multiple test cases.
