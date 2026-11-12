"""
download_data.py
----------------
Downloads the Olist Brazilian E-Commerce dataset using kagglehub
and copies all 9 CSV files into backend/data/ ready for the ETL pipeline.

Usage:
    python download_data.py
    # or
    python download_data.py --run-pipeline
"""

import sys
import shutil
from pathlib import Path

def download_and_setup(run_pipeline_after: bool = False):
    print("=" * 60)
    print("🇧🇷 Olist Brazilian E-Commerce Dataset Downloader")
    print("=" * 60)

    try:
        import kagglehub
    except ImportError:
        print("\n❌ 'kagglehub' is not installed.")
        print("Install it with:")
        print("    pip install kagglehub\n")
        sys.exit(1)

    print("\n⬇️  Downloading latest dataset version via kagglehub...")
    download_path = kagglehub.dataset_download("olistbr/brazilian-ecommerce")
    source_dir = Path(download_path)
    print(f"✅ Downloaded to cache: {source_dir}")

    # Destination directory
    target_dir = Path(__file__).resolve().parent / "data"
    target_dir.mkdir(parents=True, exist_ok=True)
    print(f"📂 Target data directory: {target_dir}")

    # Expected files
    expected_files = [
        "olist_orders_dataset.csv",
        "olist_customers_dataset.csv",
        "olist_order_items_dataset.csv",
        "olist_order_payments_dataset.csv",
        "olist_order_reviews_dataset.csv",
        "olist_products_dataset.csv",
        "olist_sellers_dataset.csv",
        "olist_geolocation_dataset.csv",
        "product_category_name_translation.csv",
    ]

    copied_count = 0
    # Search for all CSV files in source_dir recursively
    for src_file in source_dir.rglob("*.csv"):
        dest_file = target_dir / src_file.name
        print(f"   Copying {src_file.name} ({src_file.stat().st_size / (1024*1024):.1f} MB)...")
        shutil.copy2(src_file, dest_file)
        copied_count += 1

    print(f"\n✅ Copied {copied_count} files into {target_dir}")

    # Verify expected files
    missing = [f for f in expected_files if not (target_dir / f).exists()]
    if missing:
        print(f"⚠️  Warning: Missing expected files: {missing}")
    else:
        print("🎯 All 9 required CSV files are present and verified!")

    if run_pipeline_after:
        print("\n🚀 Triggering ETL pipeline now...")
        from ingestion.pipeline import run_pipeline
        run_pipeline()
    else:
        print("\n👉 Next step: Run the ETL pipeline to build SQLite database:")
        print("    python -m ingestion.pipeline")

if __name__ == "__main__":
    should_run = "--run-pipeline" in sys.argv
    download_and_setup(run_pipeline_after=should_run)

