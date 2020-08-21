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

class DefaultDict {
  constructor(defaultInit) {
    return new Proxy(
      {},
      {
        get: (target, name) =>
          name in target
            ? target[name]
            : (target[name] =
                typeof defaultInit === "function"
                  ? new defaultInit().valueOf()
                  : defaultInit)
      }
    );
  }
}

let tooltipTimeout: number;
let userDict = {};
mock.data.forEach((element) => {
  userDict[element.username] = {
    username: element.username,
    x: Math.floor(Math.random() * Math.floor(1000)),
    y: Math.floor(Math.random() * Math.floor(1000))
  };
});

console.log(userDict);
const nodesV2 = [];
Object.keys(userDict).forEach(function (key) {
  nodesV2.push(userDict[key]);
});

console.log(nodesV2);
const nodes = nodesV2;

let linkMapping = {};
const lists = new DefaultDict(Array);
mock.data.forEach((n) => {
  mock.data.forEach((j) => {
    if (n.slug_id === j.slug_id && n.username !== j.username) {
      linkMapping[n.username] = j.username;
      lists[n.username].push(j.username);
    }
  });
});

console.log(lists);

// generate links for current node to source
let links = [];
nodes.forEach((n) => {
  console.log("source", n);
  lists[n.username].forEach((vert) => {
    console.log("target", userDict[vert]);
    links.push({
      source: n,
      target: userDict[linkMapping[vert]]
    });
  });
});

console.log("jjj");
console.log(links);

// const links = [
//   { source: nodes[0], target: nodes[1] },
//   { source: nodes[1], target: nodes[2] },
//   { source: nodes[2], target: nodes[0] }
// ];

// let nodes = mock.data.map((n) => {
//   return {
//     ...n,
//     x: Math.floor(Math.random() * Math.floor(1000)),
//     y: Math.floor(Math.random() * Math.floor(1000))
//   };
// });

// let linkMapping = {};
// let countMapping = {};
// nodes.forEach((n) => {
//   //countMapping[`${n.username}-${j.username}`] = 0;
//   nodes.forEach((j) => {
//     if (n.slug_id === j.slug_id && n.username !== j.username) {
//       linkMapping[n.username] = j.username;
//       if (!(`${n.username}${j.username}` in countMapping)) {
//         countMapping[`${n.username}${j.username}`] = 0;
//       } else {
//         countMapping[`${n.username}${j.username}`]++;
//       }
//     }
//   });
// });

// create dictionary of username -> node
// var nodeMapping = nodes.reduce((map, obj) => {
//   map[obj.username] = obj;
//   return map;
// }, {});

// generate links for current node to source
// const links = nodes.map((n) => {
//   return {
//     source: n,
//     target: nodeMapping[linkMapping[n.username]]
//   };
// });

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
