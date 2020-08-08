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

// const nodes = mock.data.map((n) => {
//   return {
//     x: Math.floor(Math.random() * 2000 - 100),
//     y: Math.floor(Math.random() * 2000 - 100),
//     nodeValue: n
//   };
// });

let initialValue = {};
let key = "username";
let userDict = mock.data.reduce((obj, item) => {
  return {
    ...obj,
    [item[key]]: { source: item.username, target: item.username }
  };
}, initialValue);

key = "slug_id";
let contentDict = mock.data.reduce((obj, item) => {
  return {
    ...obj,
    [item[key]]: { source: item.slug_id, target: item.username }
  };
}, initialValue);

const graphdb = {
  ...userDict,
  ...contentDict
};

var nodes = Object.entries(graphdb).map((n) => {
  return {
    x: Math.floor(Math.random() * 2000 - 100),
    y: Math.floor(Math.random() * 2000 - 100),
    nodeVale: n[1]
  };
});

// let links = Object.entries(graphdb).map((n) => {
//   return {
//     source: graphdb[n[1].source],
//     target: graphdb[n[1].target]
//   };
// });

// let links = nodes.map(n => {
//   return {
//         source: graphdb[n.source],
//         target: graphdb[n.target]
//       };
// })

console.log(nodes);

const links = [
  { source: nodes[0], target: nodes[1] },
  { source: nodes[1], target: nodes[2] },
  { source: nodes[2], target: nodes[0] }
];

//const links = conn

const graph = {
  nodes,
  links
};

export const background = "#1a1a1a";

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
              fill="#c7ac75"
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
              stroke="#FFFFFF"
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
