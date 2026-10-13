# Smart Resource Allocation System
## Design and Analysis of Algorithms — Mini Project Report

**Project name:** Allocare — Smart Resource Allocation System  
**Technology:** HTML5, CSS3, Vanilla JavaScript  
**Project type:** Individual, client-side web application

## 1. Abstract
The Smart Resource Allocation System helps a user choose a combination of resources under a fixed budget while maximizing an assigned value score. It implements and compares a Greedy heuristic and a Dynamic Programming approach to the 0/1 Knapsack problem. The interface allows users to add resources, assign costs and value scores, set a budget, run optimization, inspect selected resources, compare algorithm statistics, and export results to CSV. The project provides a practical demonstration of algorithm design, time and space complexity, and the difference between locally attractive decisions and globally optimal decisions.

## 2. Problem Statement
Given `n` resources, each with a cost `w_i` and value `v_i`, select a subset of resources such that the total cost does not exceed budget `B` and the total value is maximized. Each resource may be selected zero or one time.

Maximize:

`Σ v_i x_i`

Subject to:

`Σ w_i x_i ≤ B`, where `x_i ∈ {0,1}`.

## 3. Objectives
1. Develop an easy-to-use interface for managing resources and budgets.
2. Implement a Greedy selection heuristic.
3. Implement Dynamic Programming for the 0/1 Knapsack problem.
4. Compare selected resources, total cost, value, operations, and measured runtime.
5. Explain theoretical complexity and algorithmic trade-offs.
6. Export the result table for further analysis.

## 4. Scope
The application runs in a modern web browser without a backend or database. Resource data exists in the current browser session and resets when the page is reloaded. The system is intended for educational demonstration using integer costs and non-negative integer value scores.

## 5. System Requirements
### Hardware
- Any modern laptop or desktop capable of running a current browser.

### Software
- Modern browser (Chrome, Firefox, Edge, or equivalent).
- Text editor for inspecting source code (optional).

### Functional requirements
- Add and remove resources.
- Edit resource name, cost, and value.
- Set a maximum budget.
- Run Greedy, Dynamic Programming, or both.
- Display resource selection and comparison metrics.
- Export results as CSV.

### Non-functional requirements
- Responsive layout.
- No external libraries or network connection required.
- Validate invalid budgets, costs, and values.
- Keep the interface understandable for a beginner.

## 6. System Modules
1. **Resource Manager:** maintains resource names, costs, and value scores.
2. **Budget Manager:** accepts and validates the available budget.
3. **Greedy Engine:** sorts resources by value-to-cost ratio and selects items that fit.
4. **Dynamic Programming Engine:** computes a DP table and backtracks to recover a selected subset.
5. **Results Dashboard:** presents total cost, value, remaining budget, selected resources, operation counts, and runtime.
6. **CSV Export:** exports algorithm results for analysis.

## 7. Algorithms

### 7.1 Greedy heuristic
1. Compute `ratio = value / cost` for every resource.
2. Sort resources by decreasing ratio.
3. Iterate through sorted resources.
4. Select a resource if its cost fits the remaining budget.
5. Return selected resources, total cost, and total value.

**Time complexity:** `O(n log n)` due to sorting.  
**Auxiliary space:** `O(n)` for the sorted list and selected indices.  
**Limitation:** For 0/1 Knapsack, Greedy does not guarantee an optimal answer.

### 7.2 Dynamic Programming
Let `DP[i][b]` represent the maximum value obtainable using the first `i` resources with capacity `b`.

Base case:

`DP[0][b] = 0` for every capacity `b`.

Recurrence:

- If `w_i > b`, `DP[i][b] = DP[i-1][b]`.
- Otherwise, `DP[i][b] = max(DP[i-1][b], DP[i-1][b-w_i] + v_i)`.

Backtracking through the table identifies the selected resources.

**Time complexity:** `O(nB)`.  
**Space complexity:** `O(nB)`.  
Here `B` is the integer capacity in the scaled unit used by the demo. The complexity is pseudo-polynomial because it depends on the numeric capacity, not just its input length.

### Implementation note about scaling
To keep browser computation practical, the demo rounds resource costs up to a capacity unit. Therefore, the DP result is optimal for the scaled instance and always remains within the actual budget, but may miss combinations that would fit when costs are considered exactly. This limitation should be stated in the presentation. A future version can let the user choose an explicit unit such as ₹100 or implement exact rupee-level DP for small budgets.

## 8. Complexity Comparison

| Metric | Greedy | Dynamic Programming |
|---|---|---|
| Approach | Local ratio-based choices | Optimal substructure and overlapping subproblems |
| Time | `O(n log n)` | `O(nB)` |
| Space | `O(n)` | `O(nB)` |
| Guaranteed optimal for 0/1 Knapsack | No | Yes for the represented scaled instance |
| Typical advantage | Fast and simple | Optimal result for its modeled capacity |

## 9. Test Plan

| Test | Input | Expected behavior |
|---|---|---|
| 1 | Default sample data | Both algorithms produce results without exceeding budget |
| 2 | Very small positive budget | May select no resources; total cost stays within budget |
| 3 | Budget smaller than every cost | No resource is selected |
| 4 | One affordable resource | Algorithm can select it if its value is positive |
| 5 | Equal value-to-cost ratios | Greedy still produces a valid allocation |
| 6 | Zero-value resource | It does not improve total value |
| 7 | Empty inventory | User receives a validation message |
| 8 | Invalid or negative budget | User receives a validation message |
| 9 | Resource cost above budget | That resource is not selected |
| 10 | Export results | CSV downloads with both algorithm summaries |

## 10. How to Demonstrate the Project
1. Open `index.html`.
2. Explain the problem: maximize total value while respecting a budget.
3. Show the resource inventory and change the budget.
4. Run both algorithms and compare their selected resources.
5. Explain why Greedy can differ from Dynamic Programming.
6. Show the complexity panel and CSV export.
7. Discuss the capacity scaling limitation honestly.

## 11. Future Scope
- Import resource data from CSV.
- Add categories, required resources, and excluded resources.
- Allow the user to select the cost unit and display its effect on accuracy.
- Add charts over multiple input cases.
- Add further optimization algorithms for comparison.
- Save resource sets using browser local storage.

## 12. Conclusion
The project provides an interactive demonstration of the 0/1 Knapsack optimization problem. It illustrates the trade-off between a fast heuristic and Dynamic Programming, while presenting algorithm outcomes in a practical web interface. The project connects theoretical complexity analysis with observable results and can be extended with more exact capacity modeling and additional algorithms.

## 13. Viva Questions
**Q1. What is the 0/1 Knapsack problem?**  
It is an optimization problem in which each item can either be selected once or not selected, with total weight constrained by a capacity.

**Q2. Why can Greedy fail?**  
A locally best value-to-cost ratio can prevent the algorithm from choosing a combination with a larger total value.

**Q3. What is the time complexity of Greedy in this implementation?**  
`O(n log n)`, dominated by sorting.

**Q4. What is the time complexity of the DP solution?**  
`O(nB)`, where `B` is the integer capacity used by the table.

**Q5. What is an overlapping subproblem?**  
A smaller problem whose result is reused when solving larger instances. DP stores these results rather than recomputing them.

**Q6. What is optimal substructure?**  
An optimal solution can be constructed from optimal solutions to smaller subproblems.

**Q7. Is Dynamic Programming polynomial time?**  
It is pseudo-polynomial for Knapsack because runtime depends on the numeric capacity value.

**Q8. Why is the cost scaled in this demo?**  
A DP table with one column per rupee could be too large. Scaling keeps browser computation manageable, but rounding may exclude some feasible combinations.

**Q9. Does a lower runtime in one test prove an algorithm is asymptotically faster?**  
No. Runtime is affected by input size, browser, hardware, and measurement noise. Complexity analysis and repeated experiments are both important.

**Q10. What does auxiliary space mean?**  
Extra memory used by the algorithm, excluding the original input data.
