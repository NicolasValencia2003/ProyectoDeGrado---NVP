# Signal weights for behavior learning model
WEIGHTS = {
    "save":      1.0,
    "rate_up":   0.8,
    "dwell":     0.3,   # multiplied by min(seconds/60, 2.0)
    "view":      0.1,
    "rate_down": -0.8,
    "dismiss":   -0.6
}
RECENCY = {"7d": 1.0, "30d": 0.7, "90d": 0.4}
MIN_EVENTS      = 5
MAX_EVENTS      = 20
MAX_ML_STRENGTH = 0.80
