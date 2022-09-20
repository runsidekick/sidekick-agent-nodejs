<p align="center">
  <img width="30%" height="30%" src="https://4750167.fs1.hubspotusercontent-na1.net/hubfs/4750167/Sidekick%20OS%20repo/logo-1.png">
</p>
<p align="center">
  Sidekick Node.js Agent
</p>

<p align="center">
    <a href="https://github.com/runsidekick/sidekick" target="_blank"><img src="https://img.shields.io/github/license/runsidekick/sidekick?style=for-the-badge" alt="Sidekick Licence" /></a>&nbsp;
    <a href="https://www.runsidekick.com/discord-invitation?utm_source=sidekick-nodejs-readme" target="_blank"><img src="https://img.shields.io/discord/958745045308174416?style=for-the-badge&logo=discord&label=DISCORD" alt="Sidekick Discord Channel" /></a>&nbsp;
    <a href="https://www.runforesight.com?utm_source=sidekick-nodejs-readme" target="_blank"><img src="https://img.shields.io/badge/Monitored%20by-Foresight-%239900F0?style=for-the-badge" alt="Foresight monitoring" /></a>&nbsp;
    <a href="https://app.runsidekick.com/sandbox?utm_source=sidekick-nodejs-readme" target="_blank"><img src="https://img.shields.io/badge/try%20in-sandbox-brightgreen?style=for-the-badge" alt="Sidekick Sandbox" /></a>&nbsp;
    
</p>

<a name="readme-top"></a>

<div align="center">
    <a href="https://github.com/runsidekick/sidekick"><strong>Sidekick Main Repository »</strong></a>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#what-is-sidekick">What is Sidekick?</a>
      <ul>
        <li><a href="#sidekick-actions">Sidekick Actions</a></li>
      </ul>
    </li>
    <li>
      <a href="#sidekick-nodejs-agent">Sidekick Node.js Agent</a>
    </li>
    <li>
      <a href="#usage">Usage</a>
    </li>
    <li>
      <a href="#build">Build the agent</a>
    </li>
    <li>
      <a href="#official-sidekick-agents">Official Sidekick Agents</a>
    </li>
    <li>
      <a href="#resources">Resources</a>
    </li>
    <li><a href="#questions-problems-suggestions">Questions? Problems? Suggestions?</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## What is Sidekick?
Sidekick is a live application debugger that lets you troubleshoot your applications while they keep on running.

Add dynamic logs and put non-breaking breakpoints in your running application without the need of stopping & redeploying.

Sidekick Open Source is here to allow self-hosting and make live debugging more accessible. Built for everyone who needs extra information from their running applications. 
<p align="center">
  <img width="70%" height="70%" src="https://4750167.fs1.hubspotusercontent-na1.net/hubfs/4750167/Sidekick%20OS%20repo/HowSidekickWorks.gif">
</p>


##### Sidekick Actions:
Sidekick has two major actions; Tracepoints & Logpoints.

- A **tracepoint** is a non-breaking remote breakpoint. In short, it takes a snapshot of the variables when the code hits that line.
- **Logpoints** open the way for dynamic(on-demand) logging to Sidekick users. Replacing traditional logging with dynamic logging has the potential to lower stage sizes, costs, and time for log searching while adding the ability to add new logpoints without editing the source code, redeploying, or restarting the application.

Supported runtimes: Java, Python, Node.js

To learn more about Sidekick features and capabilities, see our [web page.](https://www.runsidekick.com/?utm_source=sidekick-nodejs-readme)

<p align="center">
  <a href="https://app.runsidekick.com/sandbox?utm_source=github&utm_medium=readme" target="_blank"><img width="345" height="66" src="https://4750167.fs1.hubspotusercontent-na1.net/hubfs/4750167/Sidekick%20OS%20repo/try(1)%201.png"></a>
</p>

<p align="center">
  <a href="https://www.runsidekick.com/discord-invitation?utm_source=sidekick-nodejs-readme" target="_blank"><img width="40%" height="40%" src="https://4750167.fs1.hubspotusercontent-na1.net/hubfs/4750167/Sidekick%20OS%20repo/joindiscord.png"></a>
</p>
<div align="center">
    <a href="https://www.runsidekick.com/?utm_source=sidekick-nodejs-readme"><strong>Learn More »</strong></a>
</div>
<p align="right">(<a href="#readme-top">back to top</a>)</p>


# Sidekick Node.js Agent

Sidekick Node.js agent allows you to inject tracepoints (non-breaking breakpoints) and logpoints dynamically to capture call stack snapshots (with variables) and add log messages on the fly without code modification, re-build and re-deploy. So it helps you, your team, and your organization to reduce MTTR (Minimum Time to Repair/Resolve).

To achieve this, Sidekick  Node.js  agent makes use of V8's inspector API.

The advantages of Sidekick over classical APM solutions is that, Sidekick

  - can debug and trace any location (your code base or 3rd party dependency) in your application, not just the external (DB, API, etc ...) calls like APM solutions
  - has zero overhead when you don't have any tracepoint or logpoint but APMs have always
  - doesn't produce too much garbage data because it collects data only at the certain points you specified as long as that point (tracepoint/logpoint) is active


## Usage

```
npm install @runsidekick/sidekick-agent-nodejs
```

[Docs](https://docs.runsidekick.com/installation/installing-agents/node.js?utm_source=sidekick-nodejs-readme)

There are two way to integrate Sidekick agent to your application.

### Integrate Agent with Environment Variable

You can easily integrate Sidekick using below environment variables.

* set ``SIDEKICK_APIKEY`` environment variable with your Sidekick api key. 
* set ``NODE_OPTIONS`` environment variable with `` '-r @runsidekick/sidekick-agent-nodejs/dist/bootstrap' ``

### Integrate Agent with Code

You can easily integrate Sidekick adding below code block to top of your project.

JS example
``` js
const SidekickDebugger = require('@runsidekick/sidekick-agent-nodejs');

SidekickDebugger.start({ 
    apiKey: '<Your_Api_Key>'
});

...
```

TS example
``` ts
import * as SidekickDebugger from '@runsidekick/sidekick-agent-nodejs';

SidekickDebugger.start({ 
    apiKey: '<Your_Api_Key>'
});

...

```

## Configs

| Config                                        | Requirement       | Environment Variable                          | Default
| ---                                           | ---               | ---                                           | ---
| apiKey <string>                               | Required          | SIDEKICK_APIKEY                               | None
| logLevel <string>                             | Optional          | SIDEKICK_AGENT_LOG_LEVEL                      | info
| disable <boolean>                             | Optional          | SIDEKICK_AGENT_DISABLE                        | false
| brokerHost <string>                           | Optional          | SIDEKICK_AGENT_BROKER_HOST                    | Sidekick broker address
| brokerPort <string>                           | Optional          | SIDEKICK_AGENT_BROKER_PORT                    | Sidekick broker port
| brokerClient <string>                         | Optional          | SIDEKICK_AGENT_BROKER_CLIENT                  | Logged in user
| applicationId <string>                        | Optional          | SIDEKICK_AGENT_APPLICATION_ID                 | Generated by agent
| applicationName <string>                      | Optional          | SIDEKICK_AGENT_APPLICATION_NAME               | Empty string
| applicationInstanceId <string>                | Optional          | SIDEKICK_AGENT_APPLICATION_INSTANCE_ID        | Generated by agent
| applicationVersion <string>                   | Optional          | SIDEKICK_AGENT_APPLICATION_VERSION            | Empty string
| applicationStage <string>                     | Optional          | SIDEKICK_AGENT_APPLICATION_STAGE              | Empty string
| applicationTag <map>                          | Optional          | SIDEKICK_AGENT_APPLICATION_TAG                | None
| maxFrames <number>                            | Optional          | SIDEKICK_AGENT_MAX_FRAMES                     | 20
| maxExpandFrames <number>                      | Optional          | SIDEKICK_AGENT_MAX_EXPAND_FRAMES              | 1
| maxProperties <number>                        | Optional          | SIDEKICK_AGENT_MAX_PROPERTIES                 | 10
| maxParseDepth <number>                        | Optional          | SIDEKICK_AGENT_MAX_PARSE_DEPTH                | 3
| propertyAccessClassification <string>         | Optional          | SIDEKICK_AGENT_PROPERTY_ACCESS_CLASSIFICATION | ENUMERABLE-OWN
| scriptPrefix <string>                         | Optional          | SIDEKICK_AGENT_SCRIPT_PREFIX                  | None
| rejectOnStartup <boolean>                     | Optional          | SIDEKICK_AGENT_REJECT_ON_STARTUP              | false
| captureFrameDataReductionCallback <function>  | Optional          |                                               | None
| logMessageDataReductionCallback <function>    | Optional          |                                               | None
| errorCollectionEnable <boolean>               | Optional          | SIDEKICK_AGENT_ERROR_COLLECTION_ENABLE        | false
| errorCollectionEnableCaptureFrame <boolean>   | Optional          | SIDEKICK_AGENT_ERROR_COLLECTION_CAPTURE_FRAME | false

### Valid Config Values

- `propertyAccessClassification` (`SIDEKICK_AGENT_PROPERTY_ACCESS_CLASSIFICATION`) configuration can take one of following values:
  - `ENUMERABLE-OWN` (default value)
  - `ENUMERABLE-OWN-AND-ENUMERABLE-PARENT`
  - `ENUMERABLE-OWN-AND-NON-ENUMERABLE-OWN`
  - `ENUMERABLE-OWN-AND-NON-ENUMERABLE-OWN-ENUMERABLE-PARENT`

## Build

- `npm run clean-build:all`


##  Official Sidekick Agents

- [Java](https://github.com/runsidekick/sidekick-agent-java)
- [Node.js](https://github.com/runsidekick/sidekick-agent-nodejs)
- [Python](https://github.com/runsidekick/sidekick-agent-python)

## Resources:

- [Documentation](https://docs.runsidekick.com/?utm_source=sidekick-nodejs-readme)
- [Community](https://github.com/runsidekick/sidekick/discussions)
- [Discord](https://www.runsidekick.com/discord-invitation?utm_source=sidekick-nodejs-readme)
- [Contributing](https://github.com/runsidekick/sidekick/blob/master/CONTRIBUTING.md)
- [Sidekick Main Repository](https://github.com/runsidekick/sidekick)

## Questions? Problems? Suggestions?

To report a bug or request a feature, create a [GitHub Issue](https://github.com/runsidekick/sidekick-agent-nodejs/issues). Please ensure someone else has not created an issue for the same topic.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

[Reach out on the Discord](https://www.runsidekick.com/discord-invitation?utm_source=sidekick-nodejs-readme). A fellow community member or Sidekick engineer will be happy to help you out.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


