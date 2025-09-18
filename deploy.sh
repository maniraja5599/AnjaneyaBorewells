#!/bin/bash

# Anjaneya Borewells Website Deployment Script
# This script helps deploy the website to various hosting platforms

set -e

echo "🚀 Anjaneya Borewells Website Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate required files
validate_files() {
    print_status "Validating required files..."
    
    local required_files=(
        "index.html"
        "admin.html"
        "styles.css"
        "script.js"
        "manifest.json"
        "sw.js"
        "package.json"
        "README.md"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file missing: $file"
            exit 1
        fi
    done
    
    print_success "All required files present"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    if command_exists node; then
        if [ -f "tests/calculator.test.js" ]; then
            node tests/calculator.test.js
            print_success "Tests completed"
        else
            print_warning "Test file not found, skipping tests"
        fi
    else
        print_warning "Node.js not found, skipping tests"
    fi
}

# Function to optimize files
optimize_files() {
    print_status "Optimizing files for production..."
    
    # Create optimized versions (basic optimization)
    if command_exists npx; then
        print_status "Minifying CSS..."
        npx clean-css-cli -o styles.min.css styles.css 2>/dev/null || print_warning "CSS minification failed"
        
        print_status "Minifying JavaScript..."
        npx uglify-js script.js -o script.min.js 2>/dev/null || print_warning "JS minification failed"
    else
        print_warning "Minification tools not available, using original files"
    fi
    
    print_success "File optimization completed"
}

# Function to create deployment package
create_package() {
    print_status "Creating deployment package..."
    
    local package_name="anjaneya-borewells-$(date +%Y%m%d-%H%M%S).zip"
    
    # Create temporary directory
    local temp_dir=$(mktemp -d)
    cp -r . "$temp_dir/"
    
    # Remove unnecessary files
    cd "$temp_dir"
    rm -rf .git .gitignore node_modules .env *.log
    
    # Create zip package
    zip -r "../$package_name" . >/dev/null
    cd - >/dev/null
    
    # Clean up
    rm -rf "$temp_dir"
    
    print_success "Deployment package created: $package_name"
    echo "$package_name"
}

# Function to deploy to Netlify
deploy_netlify() {
    print_status "Deploying to Netlify..."
    
    if command_exists netlify; then
        netlify deploy --prod --dir . --site anjaneya-borewells
        print_success "Deployed to Netlify successfully"
    else
        print_warning "Netlify CLI not found. Please install it or deploy manually."
        print_status "Manual deployment:"
        echo "1. Go to https://netlify.com"
        echo "2. Drag and drop the project folder"
        echo "3. Or connect your GitHub repository"
    fi
}

# Function to deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if command_exists vercel; then
        vercel --prod
        print_success "Deployed to Vercel successfully"
    else
        print_warning "Vercel CLI not found. Please install it or deploy manually."
        print_status "Manual deployment:"
        echo "1. Go to https://vercel.com"
        echo "2. Import your GitHub repository"
        echo "3. Deploy automatically"
    fi
}

# Function to deploy to GitHub Pages
deploy_github() {
    print_status "Deploying to GitHub Pages..."
    
    if [ -d ".git" ]; then
        # Create gh-pages branch
        git checkout -b gh-pages 2>/dev/null || git checkout gh-pages
        
        # Add and commit files
        git add .
        git commit -m "Deploy website $(date)" || true
        
        # Push to GitHub
        git push origin gh-pages
        
        print_success "Deployed to GitHub Pages successfully"
        print_status "Enable GitHub Pages in repository settings"
    else
        print_error "Not a git repository. Please initialize git first."
    fi
}

# Function to deploy to traditional hosting
deploy_ftp() {
    print_status "Preparing for FTP deployment..."
    
    local package_name=$(create_package)
    
    print_success "FTP package ready: $package_name"
    print_status "Upload the following files to your web server:"
    echo "- index.html"
    echo "- admin.html"
    echo "- styles.css"
    echo "- script.js"
    echo "- manifest.json"
    echo "- sw.js"
    echo "- All files in the root directory"
}

# Function to setup local development
setup_local() {
    print_status "Setting up local development environment..."
    
    if command_exists npm; then
        npm install
        print_success "Dependencies installed"
        
        if [ -f "package.json" ]; then
            print_status "Available npm scripts:"
            npm run
        fi
    else
        print_warning "npm not found. Please install Node.js"
    fi
    
    print_status "Starting local server..."
    if command_exists python3; then
        python3 -m http.server 8000
    elif command_exists python; then
        python -m SimpleHTTPServer 8000
    elif command_exists php; then
        php -S localhost:8000
    else
        print_warning "No suitable local server found. Please install Python, PHP, or Node.js"
    fi
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  validate    Validate required files"
    echo "  test        Run tests"
    echo "  optimize    Optimize files for production"
    echo "  package     Create deployment package"
    echo "  netlify     Deploy to Netlify"
    echo "  vercel      Deploy to Vercel"
    echo "  github      Deploy to GitHub Pages"
    echo "  ftp         Prepare for FTP deployment"
    echo "  local       Setup local development"
    echo "  all         Run validation, tests, optimization, and create package"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 all          # Full deployment preparation"
    echo "  $0 netlify      # Deploy to Netlify"
    echo "  $0 local        # Start local development server"
}

# Main script logic
main() {
    case "${1:-help}" in
        validate)
            validate_files
            ;;
        test)
            run_tests
            ;;
        optimize)
            optimize_files
            ;;
        package)
            create_package
            ;;
        netlify)
            validate_files
            deploy_netlify
            ;;
        vercel)
            validate_files
            deploy_vercel
            ;;
        github)
            validate_files
            deploy_github
            ;;
        ftp)
            validate_files
            deploy_ftp
            ;;
        local)
            setup_local
            ;;
        all)
            validate_files
            run_tests
            optimize_files
            create_package
            print_success "Deployment preparation completed!"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
