import json

with open("/opt/data/scotland2026/data.json", "r") as f:
    data = json.load(f)

# ===== NEW SCORES FROM SHEET =====
# Skins (same as before)
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

# Bonus (updated: Sewell R5 5->15, Jeff R5 4->9, Ronny R5 0->5)
new_bonus = {
    "bart": [1, 3, 5, 3, 0, None],
    "sewell": [4, 1, 2, 3, 15, None],
    "ken": [4, 1, 3, 2, 0, None],
    "brent": [12, 3, 5, 0, 1, None],
    "zach": [7, 2, 3, 4, 0, None],
    "jeff": [14, 5, 1, 1, 9, None],
    "brad": [12, 5, 5, 0, 0, None],
    "chad": [17, 1, 3, 5, 0, None],
    "graham": [10, 6, 2, 0, 5, None],
    "adriaan": [10, 0, 2, 15, 0, None],
    "ronny": [10, 6, 5, 2, 5, None]
}

def sum_rounds(arr):
    return sum(v for v in arr if v is not None)

# New leaderboard
new_leaderboard = [
    {"playerId": "jeff",    "skins": 76, "bonus": 30, "total": 106, "note": "R5: 30+LD. Bonus: 14+5+1+1+9=30"},
    {"playerId": "ronny",   "skins": 75, "bonus": 28, "total": 103, "note": "R5: 11 skins. Old Course solo 7.29 (10 pts). Bonus: 10+6+5+2+5=28"},
    {"playerId": "graham",  "skins": 72, "bonus": 23, "total": 95,  "note": "Old Course solo 7.29 (10 pts). Bonus: 10+6+2+0+5=23"},
    {"playerId": "sewell",  "skins": 68, "bonus": 25, "total": 93,  "note": "R5 bonus: 15 pts. Bonus: 4+1+2+3+15=25"},
    {"playerId": "brent",   "skins": 68, "bonus": 21, "total": 89,  "note": "R3: 29 skins. Bonus: 12+3+5+0+1=21"},
    {"playerId": "adriaan", "skins": 61, "bonus": 27, "total": 88,  "note": "Old Course 7.27 + Kingsbarn 7.30 (20 pts). Bonus: 10+0+2+15+0=27"},
    {"playerId": "chad",    "skins": 61, "bonus": 26, "total": 87,  "note": "Old Course solo 7.30 (10 pts). Bonus: 17+1+3+5+0=26"},
    {"playerId": "bart",    "skins": 73, "bonus": 12, "total": 85,  "note": "R3: 29 skins. Bonus: 1+3+5+3+0=12"},
    {"playerId": "brad",    "skins": 58, "bonus": 22, "total": 80,  "note": "Bonus: 12+5+5+0+0=22"},
    {"playerId": "zach",    "skins": 53, "bonus": 16, "total": 69,  "note": "Bonus: 7+2+3+4+0=16"},
    {"playerId": "ken",     "skins": 47, "bonus": 10, "total": 57,  "note": "Bonus: 4+1+3+2+0=10"}
]

# Verify totals
for entry in new_leaderboard:
    pid = entry["playerId"]
    calc_skins = sum_rounds(new_skins[pid])
    calc_bonus = sum_rounds(new_bonus[pid])
    assert calc_skins == entry["skins"], f"{pid} skins: calc={calc_skins} expected={entry['skins']}"
    assert calc_bonus == entry["bonus"], f"{pid} bonus: calc={calc_bonus} expected={entry['bonus']}"
    assert calc_skins + calc_bonus == entry["total"], f"{pid} total: {calc_skins+calc_bonus} != {entry['total']}"

print("All totals verified!")

# === UPDATE EVENT STATUS ===
data["event"]["status"] = "FINAL ROUND - Championship Day at Dumbarnie"
data["event"]["currentRound"] = 6
data["event"]["totalRounds"] = 6
data["event"]["lastUpdated"] = "2026-07-31T10:00:00+01:00"

# === UPDATE SKINS BREAKDOWN ===
for entry in data["skinsBreakdown"]:
    pid = entry["playerId"]
    entry["rounds"] = new_skins[pid]

# === UPDATE BONUS BREAKDOWN ===
for entry in data["bonusBreakdown"]:
    pid = entry["playerId"]
    entry["rounds"] = new_bonus[pid]

# === UPDATE LEADERBOARD ===
data["leaderboard"] = new_leaderboard

# === UPDATE SCHEDULE - ADD DARTS & KARAOKE ===
# Update Friday (final round) to include darts & karaoke
for s in data["schedule"]:
    if "Friday July 31" in s["day"]:
        s["detail"] = "Tee times 13:50/14:00/14:10. Pickup 12:30 PM. Championship concludes. Post-round: darts at The Criterion, karaoke at Molly Malones late night. Trophy presentation at Dunvegan."

# === UPDATE PUBS SECTION WITH DARTS ===
# The Criterion is already in the pubs list, add darts mention
for p in data["pubs"]:
    if "Criterion" in p["name"]:
        p["vibe"] = "Old-school St Andrews pub. No frills, great beer, proper locals' spot. Darts board in the back room."
        p["specialty"] = "Traditional ales, a warm fire, and the darts board"

# Write updated data.json
with open("/opt/data/scotland2026/data.json", "w") as f:
    json.dump(data, f, indent=2)

print("data.json updated!")
print(f"\nNew leaderboard:")
for i, entry in enumerate(new_leaderboard):
    print(f"  {i+1}. {entry['playerId']}: {entry['skins']} skins + {entry['bonus']} bonus = {entry['total']} pts")
print(f"\nEvent: {data['event']['status']}")
print("Friday schedule updated with darts & karaoke")