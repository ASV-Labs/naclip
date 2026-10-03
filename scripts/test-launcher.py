import importlib.util
import os
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('launcher', Path(__file__).with_name('launch-isolated-mac.py'))
launcher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(launcher)

class IsolationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        self.app = root/'Hermes Test.app'
        binary = self.app/'Contents/MacOS/Hermes'
        binary.parent.mkdir(parents=True)
        binary.touch(); binary.chmod(0o700)
        self.backend = root/'backend'
        for filename in ('hermes_cli/main.py', 'venv/bin/python'):
            path = self.backend/filename
            path.parent.mkdir(parents=True, exist_ok=True)
            path.touch(); path.chmod(0o700)
        self.test = root/'test'
        self.args = SimpleNamespace(app=str(self.app), backend_root=str(self.backend), test_dir=str(self.test))

    def test_provider_secrets_and_remote_target_are_not_inherited(self):
        with patch.dict(os.environ, {'XAI_API_KEY':'test-secret','OPENAI_API_KEY':'test-secret','HERMES_DESKTOP_REMOTE_URL':'https://example.invalid','PYTHONPATH':'/production'}):
            _, _, env = launcher.prepare(self.args)
        self.assertNotIn('XAI_API_KEY', env)
        self.assertNotIn('OPENAI_API_KEY', env)
        self.assertNotIn('HERMES_DESKTOP_REMOTE_URL', env)
        self.assertNotIn('PYTHONPATH', env)
        self.assertEqual(env['HERMES_DESKTOP_ISOLATED_BACKEND'], '1')
        self.assertEqual(env['HERMES_HOME'], str(self.test.resolve()/'hermes-home'))

    def test_existing_hermes_home_is_rejected(self):
        with patch.dict(os.environ, {'HERMES_HOME':str(self.test)}):
            with self.assertRaises(ValueError): launcher.prepare(self.args)

    def test_symlinked_auth_store_is_rejected(self):
        self.test.mkdir()
        (self.test/'shared-auth').symlink_to(self.backend, target_is_directory=True)
        with self.assertRaises(ValueError): launcher.prepare(self.args)

    def test_missing_independent_runtime_is_rejected(self):
        (self.backend/'hermes_cli/main.py').unlink()
        with self.assertRaises(ValueError): launcher.prepare(self.args)

    def test_check_does_not_create_data_directories(self):
        launcher.prepare(self.args)
        self.assertFalse(self.test.exists())

if __name__ == '__main__': unittest.main()
