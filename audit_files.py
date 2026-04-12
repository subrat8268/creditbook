from pathlib import Path

print("\n=== SCANNING ALL TYPESCRIPT FILES ===")

file_stats = []
for fpath in sorted(Path('src').rglob('*')):
    if fpath.is_file() and fpath.suffix in ['.tsx', '.ts', '.jsx', '.js']:
        rel_path = str(fpath).replace('\\', '/')
        try:
            content = fpath.read_text(encoding='utf-8', errors='ignore')
            size = len(content)
            lines = len(content.split('\n'))
            file_stats.append((rel_path, size, lines))
            
            print(f"\n{'='*70}")
            print(f"PATH: {rel_path}")
            print(f"SIZE: {size} bytes | LINES: {lines}")
            print(f"{'='*70}")
            print(content[:1500] if size > 1500 else content)
            if size > 1500:
                print(f"\n... [{size - 1500} chars omitted] ...")
        except Exception as e:
            print(f"Error reading {rel_path}: {e}")

print(f"\n{'='*70}")
print("SUMMARY")
print(f"{'='*70}")
total_size = sum(s for _, s, _ in file_stats)
total_lines = sum(l for _, _, l in file_stats)
print(f"Total files: {len(file_stats)}")
print(f"Total bytes: {total_size}")
print(f"Total lines: {total_lines}")
