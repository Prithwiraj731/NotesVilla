#!/usr/bin/env bash

# ============================================================
#  Ubuntu Lab Setup
#  Packet Tracer + VS Code + Git + Python
# ============================================================

set -Eeuo pipefail

# -----------------------------
# Colors / formatting
# -----------------------------
BOLD='\033[1m'
RESET='\033[0m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'

info() {
    echo -e "${CYAN}➜${RESET} $1"
}

success() {
    echo -e "${GREEN}✔${RESET} $1"
}

warning() {
    echo -e "${YELLOW}⚠${RESET} $1"
}

error() {
    echo -e "${RED}✖${RESET} $1"
}

section() {
    echo
    echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${BOLD}$1${RESET}"
    echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
}

# -----------------------------
# Error handler
# -----------------------------
trap 'error "Setup failed at line $LINENO."' ERR

# -----------------------------
# Banner
# -----------------------------
clear

echo -e "${CYAN}"
cat <<'BANNER'

    ██████╗ ██████╗ ██╗███╗   ██╗████████╗
   ██╔═══██╗██╔══██╗██║████╗  ██║╚══██╔══╝
   ██║   ██║██████╔╝██║██╔██╗ ██║   ██║
   ██║   ██║██╔══██╗██║██║╚██╗██║   ██║
   ╚██████╔╝██║  ██║██║██║ ╚████║   ██║
    ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝   ╚═╝

             UBUNTU LAB SETUP
       Packet Tracer • VS Code • Git • Python

BANNER
echo -e "${RESET}"

echo -e "${BOLD}Starting environment setup...${RESET}"
echo

# ============================================================
# 1. Check operating system
# ============================================================

section "1/7  Checking operating system"

if [[ ! -f /etc/os-release ]]; then
    error "Cannot detect operating system."
    exit 1
fi

source /etc/os-release

info "Detected: ${PRETTY_NAME}"

if [[ "${ID}" != "ubuntu" && "${ID_LIKE:-}" != *"debian"* ]]; then
    error "This installer is intended for Ubuntu/Debian-based systems."
    exit 1
fi

success "Supported operating system detected."

# ============================================================
# 2. Check sudo
# ============================================================

section "2/7  Checking administrator access"

if [[ "${EUID}" -eq 0 ]]; then
    SUDO=""
else
    if ! command -v sudo >/dev/null 2>&1; then
        error "sudo is not installed."
        exit 1
    fi

    SUDO="sudo"
fi

success "Administrator access available."

# ============================================================
# 3. Fix Ubuntu repositories
# ============================================================

section "3/7  Configuring package repositories"

if [[ -f /etc/apt/sources.list.d/ubuntu.sources ]]; then

    info "Found Ubuntu repository configuration."

    BACKUP="/etc/apt/sources.list.d/ubuntu.sources.backup"

    if [[ ! -f "$BACKUP" ]]; then
        info "Creating repository backup..."
        $SUDO cp \
            /etc/apt/sources.list.d/ubuntu.sources \
            "$BACKUP"
        success "Repository backup created."
    fi

    # Replace problematic Indian mirror with official Ubuntu archive.
    $SUDO sed -i \
        's|http://in.archive.ubuntu.com/ubuntu|https://archive.ubuntu.com/ubuntu|g' \
        /etc/apt/sources.list.d/ubuntu.sources

    $SUDO sed -i \
        's|http://security.ubuntu.com/ubuntu|https://security.ubuntu.com/ubuntu|g' \
        /etc/apt/sources.list.d/ubuntu.sources

    success "Ubuntu repository configuration checked."

else

    warning "ubuntu.sources was not found."
    warning "Leaving existing APT repository configuration unchanged."

fi

# ============================================================
# 4. Update package lists
# ============================================================

section "4/7  Updating package lists"

info "Running apt update..."

$SUDO apt update

success "Package lists updated."

# ============================================================
# 5. Install core development tools
# ============================================================

section "5/7  Installing development tools"

PACKAGES=(
    git
    curl
    wget
    unzip
    build-essential
    python3
    python3-pip
    python3-venv
)

info "Installing Git, Python and development utilities..."

$SUDO apt install -y "${PACKAGES[@]}"

success "Development tools installed."

# ============================================================
# 6. Install VS Code
# ============================================================

section "6/7  Installing Visual Studio Code"

if command -v code >/dev/null 2>&1; then

    success "VS Code is already installed."

elif command -v snap >/dev/null 2>&1; then

    info "Installing VS Code through Snap..."

    $SUDO snap install code --classic

    success "VS Code installed."

else

    warning "Snap is not available."
    warning "Installing snapd..."

    $SUDO apt install -y snapd

    info "Installing VS Code..."

    $SUDO snap install code --classic

    success "VS Code installed."

fi

# ============================================================
# 7. Packet Tracer
# ============================================================

section "7/7  Installing Cisco Packet Tracer"

info "Installing Packet Tracer dependencies..."

$SUDO apt install -y \
    libfuse2t64 \
    libpcre2-16-0 \
    libpcre2-dev \
    libpcre2-posix3

success "Packet Tracer dependencies installed."

# ------------------------------------------------------------
# Find Packet Tracer .deb
# ------------------------------------------------------------

PACKET_DEB=""

if [[ -d "$HOME/Downloads" ]]; then

    PACKET_DEB=$(find "$HOME/Downloads" \
        -maxdepth 1 \
        -type f \
        \( -iname 'CiscoPacketTracer*.deb' -o -iname 'packettracer*.deb' \) \
        | head -n 1 || true)

fi

if [[ -n "$PACKET_DEB" ]]; then

    info "Packet Tracer package found:"
    echo
    echo "    $PACKET_DEB"
    echo

    if dpkg-query -W -f='${Status}' packettracer 2>/dev/null \
        | grep -q "install ok installed"; then

        success "Packet Tracer is already installed."

    else

        info "Installing Packet Tracer..."

        $SUDO apt install -y "$PACKET_DEB"

        success "Packet Tracer installed successfully."

    fi

else

    warning "Packet Tracer .deb was not found."

    echo
    echo "Please download Cisco Packet Tracer from Cisco Networking Academy"
    echo "and place the .deb file inside:"
    echo
    echo "    $HOME/Downloads/"
    echo
    echo "Then run:"
    echo
    echo "    sudo apt install ~/Downloads/CiscoPacketTracer*.deb"
    echo

fi

# ============================================================
# Final verification
# ============================================================

section "Installation Summary"

echo

# Git
if command -v git >/dev/null 2>&1; then
    success "Git          : $(git --version)"
else
    warning "Git          : Not detected"
fi

# Python
if command -v python3 >/dev/null 2>&1; then
    success "Python       : $(python3 --version)"
else
    warning "Python       : Not detected"
fi

# VS Code
if command -v code >/dev/null 2>&1; then
    success "VS Code      : Installed"
else
    warning "VS Code      : Not detected"
fi

# Packet Tracer
if command -v packettracer >/dev/null 2>&1; then
    success "PacketTracer : Installed"
else
    warning "PacketTracer : Not detected"
fi

echo

echo -e "${GREEN}${BOLD}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "           SETUP COMPLETED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${RESET}"

echo
echo "You can launch:"
echo
echo "  VS Code       → code"
echo "  Packet Tracer → packettracer"
echo
echo -e "${CYAN}Happy networking & coding!${RESET}"
echo