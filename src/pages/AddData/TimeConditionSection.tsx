import React from "react";
import "./AddData.css";

interface TimeValues {
  seconds: number;
  minutes: number;
  hours: number;
  months: number;
}

interface TimeConditionSectionProps {
  useTimeCondition: boolean;
  setUseTimeCondition: (value: boolean) => void;
  timeConditionType: "unlock" | "expire";
  setTimeConditionType: (value: "unlock" | "expire") => void;
  timeValues: TimeValues;
  setTimeValues: React.Dispatch<React.SetStateAction<TimeValues>>;
}

export const TimeConditionSection: React.FC<TimeConditionSectionProps> = ({
  useTimeCondition,
  setUseTimeCondition,
  timeConditionType,
  setTimeConditionType,
  timeValues,
  setTimeValues,
}) => {
  const { seconds, minutes, hours, months } = timeValues;

  const handleTimeChange = (field: keyof TimeValues, value: number) => {
    setTimeValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      <div className="time-condition-checkbox">
        <label>
          <input
            type="checkbox"
            checked={useTimeCondition}
            onChange={(e) => setUseTimeCondition(e.target.checked)}
          />
          Add Time Restrictions
        </label>
      </div>
      {useTimeCondition && (
        <div className="time-condition-wrapper">
          <div className="time-condition-type">
            <label>
              <input
                type="radio"
                value="unlock"
                checked={timeConditionType === "unlock"}
                onChange={() => setTimeConditionType("unlock")}
              />
              Unlock after
            </label>
            <label>
              <input
                type="radio"
                value="expire"
                checked={timeConditionType === "expire"}
                onChange={() => setTimeConditionType("expire")}
              />
              Expires after
            </label>
          </div>

          <div className="more-options-content">
            <div className="time-period-container">
              <div className="time-input-group">
                <label className="time-label">Seconds</label>
                <input
                  type="number"
                  min="0"
                  value={seconds}
                  onChange={(e) =>
                    handleTimeChange("seconds", parseInt(e.target.value) || 0)
                  }
                  className="time-input"
                />
              </div>
              <div className="time-input-group">
                <label className="time-label">Minutes</label>
                <input
                  type="number"
                  min="0"
                  value={minutes}
                  onChange={(e) =>
                    handleTimeChange("minutes", parseInt(e.target.value) || 0)
                  }
                  className="time-input"
                />
              </div>
              <div className="time-input-group">
                <label className="time-label">Hours</label>
                <input
                  type="number"
                  min="0"
                  value={hours}
                  onChange={(e) =>
                    handleTimeChange("hours", parseInt(e.target.value) || 0)
                  }
                  className="time-input"
                />
              </div>
              <div className="time-input-group">
                <label className="time-label">Months</label>
                <input
                  type="number"
                  min="0"
                  value={months}
                  onChange={(e) =>
                    handleTimeChange("months", parseInt(e.target.value) || 0)
                  }
                  className="time-input"
                />
              </div>
            </div>
            {seconds > 0 || minutes > 0 || hours > 0 || months > 0 ? (
              <div className="time-summary">
                Unlocks after:{" "}
                {months > 0 ? `${months} month${months !== 1 ? "s" : ""} ` : ""}
                {hours > 0
                  ? (months > 0 ? " + " : "") +
                    `${hours} hour${hours !== 1 ? "s" : ""} `
                  : ""}
                {minutes > 0
                  ? (hours > 0 || months > 0 ? " + " : "") +
                    `${minutes} minute${minutes !== 1 ? "s" : ""} `
                  : ""}
                {seconds > 0
                  ? (minutes > 0 || hours > 0 || months > 0 ? " + " : "") +
                    `${seconds} second${seconds !== 1 ? "s" : ""}`
                  : ""}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};
