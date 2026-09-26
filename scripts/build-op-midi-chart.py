#!/usr/bin/env python3
"""Compatibility entry point: OP now uses percussion-based charts."""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).with_name('build-op-drum-chart.py')), run_name='__main__')
