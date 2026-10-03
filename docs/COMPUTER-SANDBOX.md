# Set up the agent computer

NaCLip displays Hermes's Bot Screen. It does not provision a VM, install Docker, or replace Hermes's computer-use tools.

## Where the desktop runs

| Backend | Docker requirement | Screen location |
| --- | --- | --- |
| Browser preview | None | A drawing produced in the browser |
| Local macOS/Windows, Docker terminal backend | Running Linux Docker engine on that backend host | Container inside Docker's Linux VM |
| Remote Linux backend using Docker | Docker on the remote Linux machine | Remote container; client only views the stream |
| Supported Linux gateway with local terminal backend | None | Profile's Xfce/TigerVNC screen on that Linux host |
| Supported SSH/Singularity terminal backend | No Docker required by NaCLip itself | Configured backend, when it supports the desktop stack and stream |

Current Hermes source resolves `bot_desktop.placement: auto` to the terminal sandbox for supported Docker/SSH/Singularity backends. A backend without screen support is refused instead of silently moving computer control to the host. A local macOS/Windows gateway with a local terminal is not a Linux Bot Screen. Native host computer control is a different capability from this pane.

A separate Hermes data directory isolates configuration and chats; it does not sandbox tool execution. Docker isolation is also affected by configured mounts, privileges and network access. Share only the workspace the agent needs; do not assume a container makes every mounted host file unreachable.

## 1. Install and start Docker for the Docker path

Use the official instructions for your platform:

- [Docker Desktop on macOS](https://docs.docker.com/desktop/setup/install/mac-install/): choose Apple silicon or Intel as appropriate.
- [Docker Desktop on Windows](https://docs.docker.com/desktop/setup/install/windows-install/): use a supported Linux-container backend and follow the WSL/virtualization requirements.
- [Docker Engine on Linux](https://docs.docker.com/engine/install/): follow your distribution's instructions; Docker Desktop is optional here.

Read the applicable [Docker Desktop licensing terms](https://docs.docker.com/subscription-billing/desktop-license/) before installation. Docker Desktop is not free for every commercial deployment. Start the engine, then check it in the same environment that runs the Hermes backend:

```sh
docker version
docker info
```

`docker version` must show a reachable **Server**, not just a client. `docker info` should report the intended engine. If using a remote context, confirm that the agent's files and mounts belong on that remote host.

## 2. Configure the selected test profile

Use the isolated home from [native testing](NATIVE-TEST.md). Back up its existing configuration. Merge the fragment in [docker-sandbox.yaml](../examples/docker-sandbox.yaml) into that test profile's `config.yaml`:

```yaml
terminal:
  backend: docker
  docker_image: nousresearch/hermes-sandbox:desktop
bot_desktop:
  placement: auto
```

The desktop image provides the Linux screen stack. A generic Python container is insufficient. Pulling the image downloads it; it does not grant NaCLip access to your host desktop:

```sh
docker pull nousresearch/hermes-sandbox:desktop
```

The image tag is mutable. For repeatable public releases, record the tested image digest and Hermes version in release notes after live validation. This project has not yet validated that image on a live backend. Allow RAM/disk for the image and each desktop/browser; monitor actual resource use with `docker stats` instead of promising a fixed per-bot footprint.

Do not select `placement: gateway` as a workaround for an unavailable container: it intentionally moves the screen to the gateway host. Keep the intended boundary and resolve the container error.

## 3. Start and verify the screen

For the default agent in the isolated test home, use the compatible Hermes CLI in your test checkout/environment:

```sh
HERMES_HOME="$tandem_test/hermes-home" hermes computer-use screen status --json
HERMES_HOME="$tandem_test/hermes-home" hermes computer-use screen start
HERMES_HOME="$tandem_test/hermes-home" hermes computer-use screen status --json
```

For a named profile, use the CLI's `--profile <name>` option with that same isolated home. Screen status may exit nonzero while stopped; read its JSON fields. Confirm the intended profile, supported/installed/running state, placement/backend and blocker. The backend may create the container when Start runs.

Connect the test desktop to that backend and open the agent computer. Confirm a real live frame, take over, interact with a harmless test page, and hand back. A “running” badge alone does not prove a working stream. NaCLip disables takeover until its stream connects.

When finished, hand back first, then stop that test screen:

```sh
HERMES_HOME="$tandem_test/hermes-home" hermes computer-use screen stop
```

A human-held screen resists stopping by default. Do not force-stop someone else's active takeover. Stopping the screen may leave its terminal container running; manage that identified test container through Hermes/Docker rather than stopping all containers.

## Linux gateway alternative

On a supported Linux gateway with a local terminal backend, `hermes computer-use screen install` installs the screen packages through its package manager, then `screen start` starts the profile screen. This is a Linux-host path. On the Docker path, missing packages belong in the container image; installing them on macOS or on the gateway host does not repair the container.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Docker client exists, cannot connect to server | Start engine; inspect selected Docker context and backend user's access |
| Image lacks desktop packages | Use the desktop image; review the blocker's named missing binaries |
| Unsupported placement | Verify backend type and that the screen runs on Linux or a supported terminal sandbox |
| Container starts, screen will not | Read backend logs, screen status and available memory; inspect actual container state |
| Screen running, no live frame | Check authenticated gateway connectivity, compatible display RPC/stream support and plugin console |
| Wrong bot or instance appears | Stop testing; verify the connection/profile owner before requesting control |
| Take over disabled | The stream is not ready or ownership is unresolved; resolve that state |
| Custom local model unreachable from container | Check where inference runs and configure a reachable endpoint; loopback names the machine/container making the request |

No Docker installation or real screen start was performed while writing this guide.
