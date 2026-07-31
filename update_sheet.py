import json

with open("/opt/data/scotland2026/data.json", "r") as f:
    data = json.load(f)

# ===== NEW DATA FROM GOOGLE SHEET (gid=1334306976) =====

# New skins breakdown per round
new_skins = {
    "bart": [7, 9, 29, 17, 11, None],
    "sewell": [15, 0, 13, 17, 23, None],
    "ken": [11, 10, 10, 6, 10, None],
    "brent": [13, 9, 29, 11, 6, None],
    "zach": [13, 2, 10, 18, 10, None],
    "jeff": [15, 15, 11, 5, 30, None],
    "brad": [13, 13, 15, 11, 6, None],
    "chad": [13, 14, 13, 11, 10, None],
    "graham": [8, 25, 6, 10, 23, None],
    "adriaan": [8, 10, 13, 20, 10, None],
    "ronny": [8, 25, 15, 16, 11, None]
}

# New bonus breakdown per round (major re-scoring)
new_bonus = {
    "bart": [1, 3, 5, 3, 0, None],
    "sewell": [4, 1, 2, 3, 5, None],
    "ken": [4, 1, 3, 2, 0, None],
    "brent": [12, 3, 5, 0, 1, None],
    "zach": [7, 2, 3, 4, 0, None],
    "jeff": [14, 5, 1, 1, 4, None],
    "brad": [12, 5, 5, 0, 0, None],
    "chad": [17, 1, 3, 5, 0, None],
    "graham": [10, 6, 2, 0, 5, None],
    "adriaan": [10, 0, 2, 15, 0, None],
    "ronny": [10, 6, 5, 2, 0, None]
}

def sum_rounds(arr):
    return sum(v for v in arr if v is not None)

# New leaderboard sorted by total descending
new_leaderboard = [
    {"playerId": "jeff",    "skins": 76, "bonus": 25, "total": 101, "note": "R5: 30+LD. Bonus: 14+5+1+1+4=25"},
    {"playerId": "ronny",   "skins": 75, "bonus": 23, "total": 98,  "note": "R5: 11 skins. Old Course solo 7.29 (10 pts)"},
    {"playerId": "graham",  "skins": 72, "bonus": 23, "total": 95,  "note": "Old Course solo 7.29 (10 pts). Bonus: 10+6+2+0+5=23"},
    {"playerId": "brent",   "skins": 68, "bonus": 21, "total": 89,  "note": "R3: 29 skins. Bonus: 12+3+5+0+1=21"},
    {"playerId": "adriaan", "skins": 61, "bonus": 27, "total": 88,  "note": "Old Course 7.27 + Kingsbarn 7.30 (20 pts). Bonus: 10+0+2+15+0=27"},
    {"playerId": "chad",    "skins": 61, "bonus": 26, "total": 87,  "note": "Old Course solo 7.30 (10 pts). Bonus: 17+1+3+5+0=26"},
    {"playerId": "bart",    "skins": 73, "bonus": 12, "total": 85,  "note": "R3: 29 skins. Bonus: 1+3+5+3+0=12"},
    {"playerId": "sewell",  "skins": 68, "bonus": 15, "total": 83,  "note": "Bonus: 4+1+2+3+5=15"},
    {"playerId": "brad",    "skins": 58, "bonus": 22, "total": 80,  "note": "Bonus: 12+5+5+0+0=22"},
    {"playerId": "zach",    "skins": 53, "bonus": 16, "total": 69,  "note": "Bonus: 7+2+3+4+0=16"},
    {"playerId": "ken",     "skins": 47, "bonus": 10, "total": 57,  "note": "Bonus: 4+1+3+2+0=10"}
]

# Verify all totals
for entry in new_leaderboard:
    pid = entry["playerId"]
    calc_skins = sum_rounds(new_skins[pid])
    calc_bonus = sum_rounds(new_bonus[pid])
    assert calc_skins == entry["skins"], f"{pid} skins: calc={calc_skins} expected={entry['skins']}"
    assert calc_bonus == entry["bonus"], f"{pid} bonus: calc={calc_bonus} expected={entry['bonus']}"
    assert calc_skins + calc_bonus == entry["total"], f"{pid} total: {calc_skins+calc_bonus} != {entry['total']}"

print("All totals verified!")

# Update event status
data["event"]["status"] = "LIVE - Final Round Today"
data["event"]["currentRound"] = 6
data["event"]["lastUpdated"] = "2026-07-31T09:00:00+01:00"

# Update skins breakdown
for entry in data["skinsBreakdown"]:
    pid = entry["playerId"]
    entry["rounds"] = new_skins[pid]

# Update bonus breakdown
for entry in data["bonusBreakdown"]:
    pid = entry["playerId"]
    entry["rounds"] = new_bonus[pid]

# Update leaderboard
data["leaderboard"] = new_leaderboard

# Update Ronny's Old Course solo status to completed
for oc in data["oldCourseSolo"]["players"]:
    if oc["playerId"] == "ronny":
        oc["status"] = "completed"

# Write updated data.json
with open("/opt/data/scotland2026/data.json", "w") as f:
    json.dump(data, f, indent=2)

print("data.json updated!")
print(f"\nNew leaderboard:")
for i, entry in enumerate(new_leaderboard):
    print(f"  {i+1}. {entry['playerId']}: {entry['skins']} skins + {entry['bonus']} bonus = {entry['total']} pts")