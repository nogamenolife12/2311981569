const axios = require("axios");


let tasks = [];
let capacity = 0;


async function Log(stack, level, pkg, message) {
    try {
        await axios.post("http://20.244.56.144/test/log", {
            stack,
            level,
            package: pkg,
            message
        });
    } catch (e) {
        console.log("log error");
    }
}


async function getTasks() {
    try {
        let r = await axios.get("http://20.244.56.144/test/tasks");
        return r.data.tasks || [];
    } catch (e) {
        await Log("backend", "error", "api", "tasks fetch failed");
        return [];
    }
}


async function getDepot() {
    try {
        let r = await axios.get("http://20.244.56.144/test/depot");
        return r.data.capacity || 0;
    } catch (e) {
        await Log("backend", "error", "api", "depot fetch failed");
        return 0;
    }
}


function solve(tasks, cap) {
    let n = tasks.length;

    let dp = [];
    for (let i = 0; i <= n; i++) {
        dp[i] = [];
        for (let j = 0; j <= cap; j++) {
            dp[i][j] = 0;
        }
    }

    for (let i = 1; i <= n; i++) {
        let t = tasks[i - 1].time;
        let v = tasks[i - 1].score;

        for (let j = 0; j <= cap; j++) {
            if (t <= j) {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i - 1][j - t] + v);
            } else {
                dp[i][j] = dp[i - 1][j];
            }
        }
    }

   
    let res = [];
    let j = cap;

    for (let i = n; i > 0; i--) {
        if (dp[i][j] !== dp[i - 1][j]) {
            res.push(tasks[i - 1]);
            j -= tasks[i - 1].time;
        }
    }

    return {
        maxScore: dp[n][cap],
        selected: res
    };
}


async function run() {
    await Log("backend", "info", "start", "starting program");

    tasks = await getTasks();
    capacity = await getDepot();

    await Log("backend", "debug", "data", "tasks len: " + tasks.length);
    await Log("backend", "debug", "data", "capacity: " + capacity);

    if (!tasks.length || !capacity) {
        await Log("backend", "warn", "data", "empty input");
    }

    let ans = solve(tasks, capacity);

    console.log("MAX SCORE:", ans.maxScore);
    console.log("TASKS:", ans.selected);

    await Log("backend", "info", "end", "finished");
}

run();