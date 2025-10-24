# LongStrider Documentation

**Single source of truth for all system documentation.**

## 📁 Directory Structure

```
docs/
├── README.md                    # This file - documentation index
├── architecture/                # System architecture docs
│   ├── REFERENCE_IMPLEMENTATION.md
│   └── DESIGN_SYSTEM.md
├── audit/                       # System audit materials
│   ├── START_HERE.md
│   ├── README.md
│   ├── INVENTORY.md
│   ├── EDGE_FUNCTIONS_LIST.md
│   ├── public_functions.sql
│   └── public_tables.sql
└── deployment/                  # Deployment guides (future)
```

## 🎯 Key Documents

### Architecture
- **[REFERENCE_IMPLEMENTATION.md](architecture/REFERENCE_IMPLEMENTATION.md)** - Complete flow: SSE → Agent Cards → Spaces → Living Memory
- **[DESIGN_SYSTEM.md](architecture/DESIGN_SYSTEM.md)** - Design system and Living Laws

### Audit
- **[START_HERE.md](audit/START_HERE.md)** - Complete audit battle plan (Blocks 1-8)
- **[INVENTORY.md](audit/INVENTORY.md)** - Quick reference: 15 edge functions, ~40 DB functions, ~70 tables

## 📝 Documentation Standards

**All documentation lives in `/docs` - nowhere else.**

- ✅ Single markdown file per topic
- ✅ Clear hierarchical structure
- ✅ Cross-reference with relative links
- ❌ No duplicate docs in root or other directories
- ❌ No temporary deployment docs (use git for history)

---

**Last updated:** 2025-10-24
