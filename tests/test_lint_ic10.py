from pathlib import Path
import tempfile
import unittest

from tools.lint_ic10 import lint, physical_line_count


class Ic10LinterTests(unittest.TestCase):
    def test_valid_script(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            script_directory = root / "controller"
            script_directory.mkdir()
            (script_directory / "controller.ic10").write_text(
                "yield\nj 0\n", encoding="utf-8"
            )
            (script_directory / "README.md").write_text(
                "# Controller\n", encoding="utf-8"
            )

            self.assertEqual(lint(root), ([], 1))

    def test_rejects_more_than_128_physical_lines(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            script_directory = root / "too-long"
            script_directory.mkdir()
            (script_directory / "too-long.ic10").write_text(
                "# counted\n" * 129, encoding="utf-8"
            )
            (script_directory / "README.md").write_text(
                "# Too long\n", encoding="utf-8"
            )

            problems, _ = lint(root)
            self.assertTrue(any("129 lines" in problem for problem in problems))

    def test_accepts_exactly_128_physical_lines(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            script_directory = root / "at-limit"
            script_directory.mkdir()
            (script_directory / "at-limit.ic10").write_text(
                "yield\n" * 128, encoding="utf-8"
            )
            (script_directory / "README.md").write_text(
                "# At limit\n", encoding="utf-8"
            )

            self.assertEqual(lint(root), ([], 1))

    def test_requires_readme(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            script_directory = root / "undocumented"
            script_directory.mkdir()
            (script_directory / "undocumented.ic10").write_text(
                "yield\n", encoding="utf-8"
            )

            problems, _ = lint(root)
            self.assertTrue(any("missing sibling README.md" in p for p in problems))

    def test_requires_dedicated_directory(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            (root / "loose.ic10").write_text("yield\n", encoding="utf-8")
            (root / "README.md").write_text("# Scripts\n", encoding="utf-8")

            problems, _ = lint(root)
            self.assertTrue(any("own subdirectory" in p for p in problems))

    def test_accepts_multiple_programs_in_one_setup_directory(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            script_directory = root / "multi-controller"
            script_directory.mkdir()
            (script_directory / "input.ic10").write_text(
                "yield\nj 0\n", encoding="utf-8"
            )
            (script_directory / "output.ic10").write_text(
                "yield\nj 0\n", encoding="utf-8"
            )
            (script_directory / "README.md").write_text(
                "# Multi-controller\n", encoding="utf-8"
            )

            self.assertEqual(lint(root), ([], 2))

    def test_final_newline_is_not_an_extra_line(self) -> None:
        self.assertEqual(physical_line_count("yield\n"), 1)
        self.assertEqual(physical_line_count("yield\n\n"), 2)


if __name__ == "__main__":
    unittest.main()
