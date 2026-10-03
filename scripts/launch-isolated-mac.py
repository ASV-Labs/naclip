#!/usr/bin/env python3
"""Launch an already-prepared Hermes copy with its own home, auth and backend."""
import argparse
import os
from pathlib import Path
import shutil
import subprocess
import sys


def within(path, parent):
    return path == parent or parent in path.parents


def prepare(args):
    app = Path(args.app).expanduser().resolve()
    backend = Path(args.backend_root).expanduser().resolve()
    test = Path(args.test_dir).expanduser().resolve()
    forbidden = {Path.home().resolve(), (Path.home() / '.hermes').resolve()}
    if os.environ.get('HERMES_HOME'):
        forbidden.add(Path(os.environ['HERMES_HOME']).expanduser().resolve())
    for path in (app, backend, test):
        if path == Path.home().resolve() or path == Path('/'):
            raise ValueError('Choose dedicated test paths, not your home or filesystem root.')
        for home in forbidden - {Path.home().resolve()}:
            if within(path, home) or within(home, path):
                raise ValueError('Test paths must be separate from your existing Hermes home.')
    binary = app / 'Contents/MacOS/Hermes'
    python = backend / 'venv/bin/python'
    if not binary.is_file() or not os.access(binary, os.X_OK):
        raise ValueError('App must be a separately prepared executable Hermes .app copy.')
    for folder in ('hermes-home', 'shared-auth', 'electron-user-data', 'workspace'):
        if not within((test / folder).resolve(), test):
            raise ValueError('Test data folders cannot symlink outside the dedicated test directory.')
    if not (backend / 'hermes_cli/main.py').is_file() or not python.is_file() or not os.access(python, os.X_OK):
        raise ValueError('Prepare an independent Hermes source checkout and its venv first.')
    # Only these ordinary host variables survive; provider tokens, remote URL,
    # production Hermes flags, PYTHONPATH and NODE_ENV are deliberately absent.
    env = {k: os.environ[k] for k in ('HOME', 'USER', 'LOGNAME', 'PATH', 'TMPDIR', 'LANG', 'SHELL') if k in os.environ}
    env.update({
        'HERMES_HOME': str(test / 'hermes-home'),
        'HERMES_SHARED_AUTH_DIR': str(test / 'shared-auth'),
        'HERMES_DESKTOP_USER_DATA_DIR': str(test / 'electron-user-data'),
        'HERMES_DESKTOP_HERMES_ROOT': str(backend),
        'HERMES_DESKTOP_PYTHON': str(python),
        'HERMES_DESKTOP_IGNORE_EXISTING': '1',
        'HERMES_DESKTOP_ISOLATED_BACKEND': '1',
        'HERMES_DESKTOP_APP_NAME': 'Hermes NaCLip Test',
        'HERMES_DESKTOP_CWD': str(test / 'workspace'),
        'PYTHONDONTWRITEBYTECODE': '1',
    })
    return binary, test, env


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--app', required=True)
    parser.add_argument('--backend-root', required=True)
    parser.add_argument('--test-dir', required=True)
    parser.add_argument('--install-plugin', action='store_true', help='Stage this repository plugin in the test home, preserving a previous copy.')
    parser.add_argument('--check', action='store_true', help='Validate paths only; do not write or launch.')
    args = parser.parse_args()
    try:
        binary, test, env = prepare(args)
        if args.check:
            print('Paths valid. Dedicated home, Electron data, shared auth and backend will be used.')
            return 0
        running = subprocess.run(['ps', '-axo', 'command='], capture_output=True, text=True, check=True)
        if str(binary) in running.stdout.splitlines():
            print('The separate test app is already running. Close it before changing launch paths.')
            return 0
        for folder in ('hermes-home', 'shared-auth', 'electron-user-data', 'workspace'):
            (test / folder).mkdir(parents=True, exist_ok=True)
        if args.install_plugin:
            source = Path(__file__).resolve().parents[1] / 'plugin.js'
            target = test / 'hermes-home/desktop-plugins/tandem/plugin.js'
            if not within(target.resolve(), test):
                raise ValueError('Plugin target cannot symlink outside the dedicated test directory.')
            target.parent.mkdir(parents=True, exist_ok=True)
            if target.exists() and target.read_bytes() != source.read_bytes():
                shutil.copy2(target, target.with_name('plugin.js.previous'))
            shutil.copy2(source, target)
        with (test / 'launch.log').open('ab') as log:
            proc = subprocess.Popen([str(binary)], cwd=test / 'workspace', env=env,
                                    stdin=subprocess.DEVNULL, stdout=log, stderr=log,
                                    start_new_session=True)
        print('Separate Hermes NaCLip test app launched (PID %s).' % proc.pid)
        print('Use this launcher again to reopen it; opening the .app directly loses the scoped environment.')
        return 0
    except (ValueError, OSError, subprocess.SubprocessError) as error:
        print('Launch refused: %s' % error, file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
