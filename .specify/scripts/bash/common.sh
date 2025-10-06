#!/usr/bin/env bash
# Common functions and variables for all scripts

# Get repository root, with fallback for non-git repositories
get_repo_root() {
    local dir="$(pwd)"

    # Traverse upward with .specify priority
    while [ "$dir" != "/" ]; do
        # FIRST: Check for .specify
        if [ -d "$dir/.specify" ]; then
            echo "$dir"
            return 0
        fi
        # SECOND: Check for .git
        if [ -d "$dir/.git" ]; then
            echo "$dir"
            return 0
        fi
        # Move up if neither found
        dir="$(dirname "$dir")"
    done

    # Final fallback if no markers found
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    (cd "$script_dir/../../.." && pwd)
}

# Get current feature identifier (no git branch dependency)
get_current_feature() {
    # First check if SPECIFY_FEATURE environment variable is set
    if [[ -n "${SPECIFY_FEATURE:-}" ]]; then
        echo "$SPECIFY_FEATURE"
        return
    fi

    # Find the latest feature directory in specs/
    local repo_root=$(get_repo_root)
    local specs_dir="$repo_root/specs"

    if [[ -d "$specs_dir" ]]; then
        local latest_feature=""
        local highest=0

        for dir in "$specs_dir"/*; do
            if [[ -d "$dir" ]]; then
                local dirname=$(basename "$dir")
                if [[ "$dirname" =~ ^([0-9]{3})- ]]; then
                    local number=${BASH_REMATCH[1]}
                    number=$((10#$number))
                    if [[ "$number" -gt "$highest" ]]; then
                        highest=$number
                        latest_feature=$dirname
                    fi
                fi
            fi
        done

        if [[ -n "$latest_feature" ]]; then
            echo "$latest_feature"
            return
        fi
    fi

    echo "main"  # Final fallback
}

# Check if we have git available
has_git() {
    git rev-parse --show-toplevel >/dev/null 2>&1
}

check_feature_id() {
    local feature_id="$1"
    local has_git_repo="$2"

    # Validate feature ID format (warning only, not blocking)
    if [[ ! "$feature_id" =~ ^[0-9]{3}- ]]; then
        echo "[specify] Warning: Feature ID doesn't follow convention: $feature_id" >&2
        echo "[specify] Expected format: 001-feature-name" >&2
    fi

    return 0
}

get_feature_dir() { echo "$1/specs/$2"; }

get_feature_paths() {
    local repo_root=$(get_repo_root)
    local current_feature=$(get_current_feature)
    local has_git_repo="false"

    if has_git; then
        has_git_repo="true"
    fi

    local feature_dir=$(get_feature_dir "$repo_root" "$current_feature")

    cat <<EOF
REPO_ROOT='$repo_root'
CURRENT_FEATURE='$current_feature'
HAS_GIT='$has_git_repo'
FEATURE_DIR='$feature_dir'
FEATURE_SPEC='$feature_dir/spec.md'
IMPL_PLAN='$feature_dir/plan.md'
TASKS='$feature_dir/tasks.md'
RESEARCH='$feature_dir/research.md'
DATA_MODEL='$feature_dir/data-model.md'
QUICKSTART='$feature_dir/quickstart.md'
CONTRACTS_DIR='$feature_dir/contracts'
EOF
}

check_file() { [[ -f "$1" ]] && echo "  ✓ $2" || echo "  ✗ $2"; }
check_dir() { [[ -d "$1" && -n $(ls -A "$1" 2>/dev/null) ]] && echo "  ✓ $2" || echo "  ✗ $2"; }
