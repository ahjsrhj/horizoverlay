/** @format */

import React, { Component } from "react";
import { bool, string, number, object, oneOfType } from "prop-types";
import { jobRoles, otherIcons } from "./helpers";
import JobConst from "./JobConst";
// import DetailedComp from "./components/DetailedComp";
var images = require.context("./images", false, /\.png$/);

DataWrapper.propTypes = {
  text: oneOfType([string, number]).isRequired,
  label: string,
  relevant: oneOfType([bool, string, number]).isRequired,
};
DataText.propTypes = {
  type: string.isRequired,
  show: bool,
  data: object,
};
DamageBar.propTypes = {
  width: string,
  show: bool.isRequired,
};

export default class CombatantHorizontal extends Component {
  static propTypes = {
    encounterDamage: oneOfType([string, number]).isRequired,
    rank: number,
    data: object.isRequired,
    config: object.isRequired,
    isSelf: bool.isRequired,
  };
  render() {
    const { config, data, isSelf } = this.props;
    const order = this.props.rank;
    const jobName = data.Job || "WHO?";
    const name = data.name.toLowerCase();
    let jobStyleClass, jobIcon, damageWidth;

    // don't need to render this component if this is a limit break
    if (!data.Job && name === "limit break") return null;

    // Color theme byRole
    if (config.color === "byRole") {
      for (const role in jobRoles) {
        if (jobRoles[role].indexOf(data.Job.toLowerCase()) >= 0)
          jobStyleClass = ` job-${role}`;
        if (data.Job === "") {
          for (const job of jobRoles[role]) {
            if (name.indexOf(job) >= 0) jobStyleClass = ` job-${role}`;
          }
        }
      }
    } else {
      jobStyleClass = "";
    }

    // Damage Percent
    damageWidth = `${parseInt(
      (data.damage / this.props.encounterDamage) * 100,
      10
    )}%`;

    // Job icon
    if (config.showJobIcon) {
      jobIcon = "./";
      if (data.Job === "") {
        // well there are a lot of things that doesn't have a job, like summoner's pets and alike. Lets assume them all.
        let newIcon;
        newIcon = "error";
        for (const otherIcon of otherIcons) {
          if (name.indexOf(otherIcon) >= 0) newIcon = otherIcon;
        }
        jobIcon += newIcon;
      } else {
        jobIcon += data.Job.toLowerCase();
      }
      try {
        jobIcon = images(`${jobIcon}.png`);
      } catch (e) {
        console.error(e);
        jobIcon = images("./empty.png");
      }
    }

    // Character name (self, instead of 'YOU')
    const showName =
      window.location.search.indexOf("hideName=true") >= 0
        ? false
        : config.showName;
    const characterName = isSelf
      ? config.characterName
      : showName
      ? data.name
      : JobConst[data.Job.toLowerCase()] || data.Job;

    const isHealing = data.ENCHPS > data.ENCDPS;

    let maxhit;
    if (data.maxhit) maxhit = data.maxhit.replace("-", ": ");

    const {
      crithits = 0,
      DirectHitCount = 0,
      CritDirectHitCount = 0,
      hits = 1,
      deaths = 0,
      OverHealPct = "0%",
    } = data;
    const healedPercent = data["healed%"];
    // const crithealPercent = data['critheal%'];

    const parsePercent = (percent) =>
      Number.isNaN(percent) ? "0%" : `${(percent * 100).toFixed(0)}%`;
    const cirtHitPercent = parsePercent(crithits / hits);
    const directHitPercent = parsePercent(DirectHitCount / hits);
    const cirtDirectHitPercent = parsePercent(CritDirectHitCount / hits);
    let healedInfoArr = [];
    if (config.showHealedInfo) {
      healedInfoArr = [`过量:${OverHealPct}`, `疗比:${healedPercent}`];
    }

    // 暴:{cirtHitPercent} 直:{directHitPercent} 直暴:{cirtDirectHitPercent}
    const hitPercentArr = [];
    if (config.showCrithitsPercent) {
      hitPercentArr.push(`暴:${cirtHitPercent}`);
    }
    if (config.showDirectHitPercent) {
      hitPercentArr.push(`直:${directHitPercent}`);
    }
    if (config.showCirtDirectHitPercent) {
      hitPercentArr.push(`直暴:${cirtDirectHitPercent}`);
    }

    return (
      <div
        className={`row ${data.Job}${jobStyleClass}${
          isSelf && config.showSelf ? " self" : ""
        }`}
        style={{ order, position: "relative" }}
      >
        <div className="name">
          {config.showRank ? (
            <span className="rank">{`${this.props.rank}. `}</span>
          ) : (
            ""
          )}
          <span className="character-name">{characterName}</span>
        </div>
        <div
          className={`data-items${config.showHighlight ? " highlight" : ""}${
            isHealing ? " inverse" : ""
          }`}
        >
          {jobIcon && <img src={jobIcon} className="job" alt={jobName} />}
          <DataText type="hps" show={config.showHps} {...data} />
          <DataText type="job" show={!config.showHps} {...data} />
          <DataText type="dps" {...data} />
        </div>
        {/* <DetailedComp /> */}

        <DamageBar
          width={damageWidth}
          show={config.showDamagePercent}
          deaths={config.showDeathNumber ? deaths : false}
          swings={config.showSwings ? data.swings : false}
        />
        {hitPercentArr.length > 0 ? (
          <div className="ch-info">
            {hitPercentArr.reduce((str, item) => str + " " + item)}
          </div>
        ) : null}
        {healedInfoArr.length > 0 ? (
          <div className="ch-info">
            {healedInfoArr.reduce((str, item) => str + " " + item)}
          </div>
        ) : null}
        <div className="maxhit">{config.showMaxhit && maxhit}</div>
      </div>
    );
  }
}

function DamageBar({ width, show, deaths, swings }) {
  if (!show) return null;
  return (
    <div>
      <div className="damage-percent-bg">
        <div className="damage-percent-fg" style={{ width }} />
      </div>
      <div className="damage-percent">
        {deaths === false ? null : <div>死:{deaths} </div>}
        {swings === false ? null : <div>swings:{swings} </div>}
        <div
          className={
            deaths === false && swings === false ? "damage-percent-num" : null
          }
        >
          {width}
        </div>
      </div>
    </div>
  );
}

function DataWrapper(props) {
  return (
    <div className={props.relevant ? "dps" : "dps irrelevant"}>
      <div>
        <span className="damage-stats">{props.text}</span>
        <span className="label">{props.label}</span>
      </div>
    </div>
  );
}

function DataText({ type, show = true, ...data } = {}) {
  if (!show) return null;
  let text, label, relevant;
  switch (type) {
    case "hps":
      text = data.ENCHPS;
      label = " HPS";
      relevant = data.ENCHPS > data.ENCDPS;
      break;
    case "dps":
      text = data.ENCDPS;
      label = " DPS";
      relevant = data.ENCDPS > data.ENCHPS;
      break;
    case "job":
      text = data.Job.toUpperCase();
      label = "";
      relevant = "1";
      break;
    default:
  }
  return <DataWrapper text={text} label={label} relevant={relevant} />;
}
