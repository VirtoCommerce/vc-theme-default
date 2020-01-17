/// <binding BeforeBuild='default' Clean='clean' ProjectOpened='watch' />
const { series, parallel, src, dest } = require('gulp');
const gulpWatch = require("gulp").watch;
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const del = require("del");
const uglify = require("gulp-uglify");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const postcss = require("gulp-postcss");
const htmlmin = require("gulp-htmlmin");
const sourcemaps = require("gulp-sourcemaps");
const eslint = require("gulp-eslint");
const zip = require("gulp-zip");
const gitignore = require("gulp-exclude-gitignore");
const bowerMain = require("bower-main");
const merge2 = require("merge2");

var bowerMainJavaScriptFiles = bowerMain("js", "min.js");

var regex = {
    css: /\.css$/,
    html: /\.(html|htm)$/,
    js: /\.js$/,
    ext: /\.([^\.]+)$/
};

function getPackage() {
    delete require.cache[require.resolve("./package.json")];
    return require("./package.json");
}

function getBundleConfig() {
    delete require.cache[require.resolve("./bundleconfig.json")];
    return require("./bundleconfig.json");
}

function mapSources() {
    return sourcemaps.mapSources(function(sourcePath, file) {
        var sourceRootPathEndIndex = sourcePath.indexOf("assets");
        var sourceRootPath = sourcePath.substring(0, sourceRootPathEndIndex);
        // ../../../ for assets/static/bundle + ../ count of parent folders in real path
        var relativeRootPath =
            "../".repeat(
                (sourceRootPath.match(new RegExp("/", "g")) || []).length + 3
            ) + sourcePath.substring(sourceRootPathEndIndex);
        return relativeRootPath;
    });
}

function min_js() {
    var tasks = getBundles(regex.js).map(function(bundle) {
        return src(bundle.inputFiles, { base: "." , allowEmpty: true})
            .pipe(sourcemaps.init())
            .pipe(mapSources())
            .pipe(concat(bundle.outputFileName))
            .pipe(uglify({ mangle: false }))
            .pipe(sourcemaps.write("."))
            .pipe(dest("."));
    });

    return merge2(tasks);
}

function packJavaScript(){
    return merge2(
        src(bowerMainJavaScriptFiles.minified),
        src(bowerMainJavaScriptFiles.minifiedNotFound)
    )
        .pipe(concat("scripts_dependencies.js"))
        .pipe(dest("assets/static/bundle"));
}

function min_css(){
    var tasks = getBundles(regex.css).map(function(bundle) {
        return src(bundle.inputFiles, { base: "." , allowEmpty: true})
            .pipe(sourcemaps.init())
            .pipe(mapSources())
            .pipe(concat(bundle.outputFileName))
            .pipe(
                postcss([
                    autoprefixer({
                        browsers: [
                            "Explorer >= 10",
                            "Edge >= 12",
                            "Firefox >= 19",
                            "Chrome >= 20",
                            "Safari >= 8",
                            "Opera >= 15",
                            "iOS >= 8",
                            "Android >= 4.4",
                            "ExplorerMobile >= 10",
                            "last 2 versions"
                        ]
                    }),
                    cssnano()
                ])
            )
            .pipe(sourcemaps.write("."))
            .pipe(dest("."));
    });

    return merge2(tasks);
}

function min_html(){
    var tasks = getBundles(regex.html).map(function(bundle) {
        return src(bundle.inputFiles, { base: "." , allowEmpty: true})
            .pipe(concat(bundle.outputFileName))
            .pipe(
                htmlmin({
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true
                })
            )
            .pipe(dest("."));
    });
   
    return merge2(tasks);
}

function clean(){
    var files = [].concat.apply(
        [],
        getBundleConfig().map(function(bundle) {
            var fileName = bundle.outputFileName;
            return [fileName, fileName.replace(regex.ext, ".$1.map")];
        })
    );
    return del(files);
}

function watch(){
    gulpWatch("./bundleconfig.json", series(exports.min));

    getBundles(regex.js).forEach(function(bundle) {
        gulpWatch(bundle.inputFiles, series(min_js));
    });

    getBundles(regex.css).forEach(function(bundle) {
        gulpWatch(bundle.inputFiles, series(min_css));
    });

    getBundles(regex.html).forEach(function(bundle) {
        gulpWatch(bundle.inputFiles, series(min_html));
    });
}

function getBundles(regexPattern) {
    return getBundleConfig().filter(function(bundle) {
        return regexPattern.test(bundle.outputFileName);
    });
}

function lint(){
    var tasks = getBundles(regex.js)
        .filter(function(bundle) {
            return !bundle.disableLint || bundle.disableLint === undefined;
        })
        .map(function(bundle) {
            return src(bundle.inputFiles, { base: "." })
                .pipe(eslint("./.eslintrc.json"))
                .pipe(eslint.format());
        });
    return merge2(tasks);
}

function compress(){
    var package = getPackage();
    return merge2(
            src(
                [].concat(
                    ["./*/**", '!./node_modules/**'],
                    [].concat.apply(
                        [],
                        getBundleConfig().map(function(bundle) {
                            return bundle.inputFiles.map(function(inputFile) {
                                return "!" + inputFile;
                            });
                        })
                    )
                )
            )
            .pipe(gitignore()),
            // Need to add them manually because otherwise all bundles will be skipped as they are in .gitignore
            src("assets/static/bundle/**", {base: '.'}))
        .pipe(
            rename(function(path) {
                path.dirname = "default/" + path.dirname;
            })
        )
        .pipe(zip(package.name + "-" + package.version + ".zip"))
        .pipe(dest("artifacts"));
}

exports.min = parallel(min_js, min_css, min_html);
exports.clean = clean;
exports.watch = watch;
exports.packJavaScript = packJavaScript;
exports["min:js"] = min_js;
exports["min:css"] = min_css;
exports["min:html"] = min_html;
exports.compress = series(exports.min, packJavaScript, compress);
exports.default = series(clean, lint, exports.min);
