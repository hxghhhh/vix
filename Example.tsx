import React, { useMemo } from "react";
import { Graph } from "@vx/network";
import { useTooltip, Tooltip, defaultStyles } from "@vx/tooltip";
import { localPoint } from "@vx/event";
import { randomNormal } from "d3-random";
import mock from "../data.json";

const random = randomNormal(0, 100);
const sqrt3: number = Math.sqrt(3);

export type NetworkProps = {
  width: number;
  height: number;
  user: string;
};

type TooltipData = {
  x: number;
  y: number;
  user: string;
};

let tooltipTimeout: number;

let nodes = mock.data.map((n) => {
  return {
    ...n,
    x: Math.floor(Math.random() * Math.floor(1000)),
    y: Math.floor(Math.random() * Math.floor(1000))
  };
});

let linkMapping = {};
let countMapping = {};
nodes.forEach((n) => {
  //countMapping[`${n.username}-${j.username}`] = 0;
  nodes.forEach((j) => {
    if (n.slug_id === j.slug_id && n.username !== j.username) {
      linkMapping[n.username] = j.username;
      if (!(`${n.username}${j.username}` in countMapping)) {
        countMapping[`${n.username}${j.username}`] = 0;
      } else {
        countMapping[`${n.username}${j.username}`]++;
      }
    }
  });
});

console.log(countMapping);

// create dictionary of username -> node
var nodeMapping = nodes.reduce((map, obj) => {
  map[obj.username] = obj;
  return map;
}, {});

// generate links for current node to source
const links = nodes.map((n) => {
  return {
    source: n,
    target: nodeMapping[linkMapping[n.username]]
  };
});

const graph = {
  nodes,
  links
};

export const background = "#FFFFFF";

function checkPoint(a, b, x, y, r) {
  var dist_points = (a - x) * (a - x) + (b - y) * (b - y);
  r *= r;
  if (dist_points < r) {
    return true;
  }
  return false;
}

export default function Example({ width, height }: NetworkProps) {
  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip
  } = useTooltip<TooltipData>();
  return width < 10 ? null : (
    <>
      <svg width={width} height={height}>
        <rect width={width} height={height} rx={14} fill={background} />
        <Graph
          graph={graph}
          nodeComponent={() => (
            <circle
              r={15}
              fill="#3AB795"
              onClick={() => hideTooltip()}
              onMouseOut={() => {
                tooltipTimeout = window.setTimeout(() => {
                  hideTooltip();
                }, 300);
              }}
              onMouseEnter={(event) => {
                if (tooltipTimeout) clearTimeout(tooltipTimeout);
                const coords = localPoint(event);
                nodes.map((n) => {
                  if (checkPoint(n.x, n.y, coords.x, coords.y, 100)) {
                    showTooltip({
                      tooltipLeft: coords.x,
                      tooltipTop: coords.y,
                      tooltipData: n
                    });
                  }
                });
              }}
            />
          )}
          linkComponent={({ link }) => (
            <line
              x1={link.source.x}
              y1={link.source.y}
              x2={link.target.x}
              y2={link.target.y}
              strokeWidth={2}
              stroke="#FF7E6B"
              strokeOpacity={0.6}
            />
          )}
        />
      </svg>
      {tooltipOpen && tooltipData && (
        <Tooltip left={tooltipLeft} top={tooltipTop}>
          <div>{JSON.stringify(tooltipData)}</div>
        </Tooltip>
      )}
    </>
  );
}
