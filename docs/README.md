# LongStrider Documentation

**Single source of truth for all system documentation.**

**Last Cleanup**: 2025-10-31 - Nuked ghost issues and outdated plans

---

## 📁 Directory Structure

```
docs/
├── README.md                           # This file - documentation index
├── CCE-O-ARCHITECTURE.md              # ✅ AUTHORITATIVE - "One door in, one door out"
├── LIVING-MEMORY-VISION.md            # ✅ CURRENT - Memory system vision
├── CURSOR-CHANGES-REVIEW.md           # ✅ ACTIVE - Session work tracker
│
├── architecture/                      # System architecture
│   ├── PAYLOAD.md                     # ✅ AUTHORITATIVE - v2.0 payload spec
│   ├── DESIGN_SYSTEM.md               # ✅ CANONICAL - Design living laws v2.0
│   └── REFERENCE_IMPLEMENTATION.md    # ✅ CURRENT - SSE → Cards → Spaces flow
│
├── audit/                             # System audit materials
│   ├── START_HERE.md                  # Brain surgery guide
│   ├── INVENTORY.md                   # Quick reference
│   └── EDGE_FUNCTIONS_LIST.md         # All 15 edge functions
│
└── archive/                           # Historical implementations
    ├── README.md                      # Archive index
    └── space-creation-implementation.md
```

---

## 🎯 Key Documents (CURRENT & AUTHORITATIVE)

### Core Architecture
- **[CCE-O-ARCHITECTURE.md](CCE-O-ARCHITECTURE.md)** - The "one door in, one door out" rule
- **[LIVING-MEMORY-VISION.md](LIVING-MEMORY-VISION.md)** - Memory system vision
- **[architecture/PAYLOAD.md](architecture/PAYLOAD.md)** - v2.0 payload specification
- **[architecture/REFERENCE_IMPLEMENTATION.md](architecture/REFERENCE_IMPLEMENTATION.md)** - SSE → Cards → Spaces flow
- **[architecture/DESIGN_SYSTEM.md](architecture/DESIGN_SYSTEM.md)** - Design living laws v2.0

### Active Work
- **[CURSOR-CHANGES-REVIEW.md](CURSOR-CHANGES-REVIEW.md)** - Session work tracker

### System Audit
- **[audit/START_HERE.md](audit/START_HERE.md)** - Brain surgery audit guide
- **[audit/INVENTORY.md](audit/INVENTORY.md)** - Quick reference

## 📝 Documentation Standards

**All documentation lives in `/docs` - nowhere else.**

- ✅ Single markdown file per topic
- ✅ Clear hierarchical structure
- ✅ Cross-reference with relative links
- ❌ No duplicate docs in root or other directories
- ❌ No temporary deployment docs (use git for history)

---

---

**Last updated:** 2025-10-31

**Ghost Issues Killed**:
- ✅ Semantic search IS implemented (cce-recall:1208)
- ✅ Token bloat WAS fixed (cce-conductor:949)
- Archive docs that claimed these were broken: DELETED
