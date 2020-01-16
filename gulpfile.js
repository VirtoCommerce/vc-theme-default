/// <binding BeforeBuild='default' Clean='clean' ProjectOpened='watch' />

var gulp = require("gulp"),
    inject = require("gulp-inject"),
    filter = require("gulp-filter"),
    concat = require("gulp-concat"),
    replace = require("gulp-replace"),
    rename = require("gulp-rename"),
    clean = require("gulp-clean"),
    del = require("del"),
    mergestream = require("merge-stream"),
    sequence = require("run-sequence"),
    util = require("gulp-util"), // preserve to be able output custom messages in future
    uglify = require("gulp-uglify"),
    bourbon = require("node-bourbon"),
    autoprefixer = require("autoprefixer"),
    mainBowerFiles = require("main-bower-files"),
    cssnano = require("cssnano"),
    postcss = require("gulp-postcss"),
    sass = require("gulp-sass"),
    htmlmin = require("gulp-htmlmin"),
    imagemin = require("gulp-image"),
    sourcemaps = require("gulp-sourcemaps"),
    eslint = require("gulp-eslint"),
    zip = require("gulp-zip"),
    gitignore = require("gulp-exclude-gitignore"),
    bowerMain = require("bower-main"),
    merge2 = require("merge2");

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

function merge(streams) {
    return streams.length ? mergestream(streams) : mergestream().end();
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

gulp.task("min:js", gulp.series(function(done) {
    var tasks = getBundles(regex.js).map(function(bundle) {
        return gulp
            .src(bundle.inputFiles, { base: "." , allowEmpty: true})
            .pipe(sourcemaps.init())
            .pipe(mapSources())
            .pipe(concat(bundle.outputFileName))
            .pipe(uglify({ mangle: false }))
            .pipe(sourcemaps.write("."))
            .pipe(gulp.dest("."));
    });

    if(!tasks.length){
        done();
    }
    return merge(tasks);
}));

gulp.task("packJavaScript", function() {
    return merge2(
        gulp.src(bowerMainJavaScriptFiles.minified),
        gulp.src(bowerMainJavaScriptFiles.minifiedNotFound)
    )
        .pipe(concat("scripts_dependencies.js"))
        .pipe(gulp.dest("assets/static/bundle"));
});

gulp.task("min:css", gulp.series(function(done) {
    var tasks = getBundles(regex.css).map(function(bundle) {
        return gulp
            .src(bundle.inputFiles, { base: "." , allowEmpty: true})
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
            .pipe(gulp.dest("."));
    });

    if(!tasks.length){
        done();
    }
    return merge(tasks);
}));

gulp.task("min:html", function(done) {
    var tasks = getBundles(regex.html).map(function(bundle) {
        return gulp
            .src(bundle.inputFiles, { base: "." , allowEmpty: true})
            .pipe(concat(bundle.outputFileName))
            .pipe(
                htmlmin({
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true
                })
            )
            .pipe(gulp.dest("."));
            
    });
    
    if(!tasks.length){
        done();
    }
    return merge(tasks);
});

gulp.task("clean", gulp.series(function() {
    var files = [].concat.apply(
        [],
        getBundleConfig().map(function(bundle) {
            var fileName = bundle.outputFileName;
            return [fileName, fileName.replace(regex.ext, ".$1.map")];
        })
    );

    return del(files);
}));

gulp.task("min",  gulp.series("min:js", "min:css", "min:html"));

gulp.task("watch", function() {
    gulp.watch("./bundleconfig.json", gulp.series("min"));

    getBundles(regex.js).forEach(function(bundle) {
        gulp.watch(bundle.inputFiles, gulp.series("min:js"));
    });

    getBundles(regex.css).forEach(function(bundle) {
        gulp.watch(bundle.inputFiles, gulp.series("min:css"));
    });

    getBundles(regex.html).forEach(function(bundle) {
        gulp.watch(bundle.inputFiles, gulp.series("min:html"));
    });
});

function getBundles(regexPattern) {
    return getBundleConfig().filter(function(bundle) {
        return regexPattern.test(bundle.outputFileName);
    });
}

gulp.task("lint", function() {
    var tasks = getBundles(regex.js)
        .filter(function(bundle) {
            return !bundle.disableLint || bundle.disableLint === undefined;
        })
        .map(function(bundle) {
            return gulp
                .src(bundle.inputFiles, { base: "." })
                .pipe(eslint("./.eslintrc.json"))
                .pipe(eslint.format());
        });
    return merge(tasks);
});

gulp.task("compress", gulp.series("min", "packJavaScript"), function () {
    var package = getPackage();
    return merge2(
            gulp.src(
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
            gulp.src("assets/static/bundle/**", {base: '.'}))
        .pipe(
            rename(function(path) {
                path.dirname = "default/" + path.dirname;
            })
        )
        .pipe(zip(package.name + "-" + package.version + ".zip"))
        .pipe(gulp.dest("artifacts"));
});

// DEFAULT Tasks
gulp.task("default", gulp.series("lint", "min", function(done) { done();}));


