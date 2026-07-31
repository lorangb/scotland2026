import json

with open("/opt/data/scotland2026/data.json", "r") as f:
    data = json.load(f)

# R6 skins (Dumbarnie)
r6_skins = {
    "jeff": 19, "brent": 19, "brad": 6, "sewell": 6,
    "ken": 33, "adriaan": 28, "bart": 28,
    "zach": 20, "graham": 20, "chad": 11, "ronny": 11
}

# R6 bonus points
r6_bonus = {
    "jeff": 1, "brent": 1, "brad": 0, "sewell": 0,
    "ken": 22, "adriaan": 4, "bart": 4,
    "zach": 1, "graham": 1, "chad": 3, "ronny": 3
}

# Verify totals
for pid in r6_skins:
    assert pid in r6_bonus, f"Missing {pid} in r6_bonus"

# Update skinsBreakdown (fill R6 column)
for entry in data["skinsBreakdown"]:
    pid = entry["playerId"]
    entry["rounds"][5] = r6_skins[pid]

# Update bonusBreakdown (fill R6 column)
for entry in data["bonusBreakdown"]:
    pid = entry["playerId"]
    entry["rounds"][5] = r6_bonus[pid]

def sum_rounds(arr):
    return sum(v for v in arr if v is not None)

# Calculate final totals
final_leaderboard = []
for pid in r6_skins:
    sk = sum_rounds([e["rounds"] for e in data["skinsBreakdown"] if e["playerId"] == pid][0])
    bo = sum_rounds([e["rounds"] for e in data["bonusBreakdown"] if e["playerId"] == pid][0])
    final_leaderboard.append({"playerId": pid, "skins": sk, "bonus": bo, "total": sk + bo})

# Sort by total descending
final_leaderboard.sort(key=lambda x: x["total"], reverse=True)

# Add notes
notes = {
    "jeff": "CHAMPION. R6: 19+LD. Final: 95 skins + 31 bonus = 126",
    "adriaan": "Runner-up. R6: 28+3birdies+Japan. Old Course+Kingsbarn solo (20 pts). Final: 89+31=120",
    "bart": "Co-3rd. R6: 28+3birdies+Japan. Final: 101+16=117",
    "ronny": "Co-3rd. R6: 11+birdie+LD+Japan. Old Course solo (10 pts). Final: 86+31=117",
    "graham": "5th. R6: 20+birdie. Old Course solo (10 pts). Final: 92+24=116",
    "ken": "6th. R6: 33+eagle chip-in (20)+2LDs. Final: 80+32=112",
    "brent": "7th. R6: 19+LD. Final: 87+22=109",
    "chad": "8th. R6: 11+birdie+LD+Japan. Old Course solo (10 pts). Final: 72+29=101",
    "sewell": "9th. The man who made it happen. Final: 74+25=99",
    "zach": "10th. R6: 20+birdie. Final: 73+17=90",
    "brad": "11th. Final: 64+22=86"
}

for entry in final_leaderboard:
    entry["note"] = notes[entry["playerId"]]

# Update data
data["leaderboard"] = final_leaderboard
data["event"]["status"] = "CHAMPIONSHIP COMPLETE"
data["event"]["currentRound"] = 6
data["event"]["totalRounds"] = 6
data["event"]["lastUpdated"] = "2026-07-31T18:00:00+01:00"

# Update schedule - mark R6 as complete
for s in data["schedule"]:
    if "Friday July 31" in s["day"]:
        s["detail"] = "Tee times 13:50/14:00/14:10. Pickup 12:30 PM. Championship complete. Post-round: darts at The Criterion, karaoke at Molly Malones late night. Trophy presentation at Dunvegan."

with open("/opt/data/scotland2026/data.json", "w") as f:
    json.dump(data, f, indent=2)

print("=== FINAL LIST GOLF SCOTLAND 2026 CHAMPIONSHIP ===")
print(f"\n{'#':>2} {'Player':>12} {'Skins':>6} {'Bonus':>6} {'Total':>6}")
print("-" * 34)
for i, entry in enumerate(final_leaderboard):
    print(f"{i+1:>2} {entry['playerId']:>12} {entry['skins']:>6} {entry['bonus']:>6} {entry['total']:>6}")

# Verify all sums
print("\n=== VERIFICATION ===")
for entry in data["skinsBreakdown"]:
    pid = entry["playerId"]
    rds = entry["rounds"]
    actual = sum_rounds(rds)
    expected = [p["skins"] for p in final_leaderboard if p["playerId"] == pid][0]
    assert actual == expected, f"{pid} skins mismatch: {actual} vs {expected}"
for entry in data["bonusBreakdown"]:
    pid = entry["playerId"]
    rds = entry["rounds"]
    actual = sum_rounds(rds)
    expected = [p["bonus"] for p in final_leaderboard if p["playerId"] == pid][0]
    assert actual == expected, f"{pid} bonus mismatch: {actual} vs {expected}"
print("ALL TOTALS VERIFIED ✓")