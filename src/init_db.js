export const init_db = async () => {
    let db;
    var db_mobilesurvey = indexedDB.open("db_mobilesurvey", 1);

    db_mobilesurvey.onsuccess = function (e) {
        db = e.target.result;
    };
    db_mobilesurvey.onerror = function (e) {
        console.log("onerror!");
        console.dir(e);
    };
    db_mobilesurvey.onupgradeneeded = function (e) {
        db = e.target.result;
        if (!db.objectStoreNames.contains("templates")) {
            var templates = db.createObjectStore("templates", {
                autoIncrement: true,
            });
        }
        if (!db.objectStoreNames.contains("mbtiles")) {
            var mbtiles = db.createObjectStore("mbtiles", {
                autoIncrement: true,
            });
        }
        if (!db.objectStoreNames.contains("complete_surveys")) {
            var complete_surveys = db.createObjectStore(
                "complete_surveys",
                {
                    autoIncrement: true,
                }
            );
        }
        if (!db.objectStoreNames.contains("objects_to_save")) {
            var objects_to_save = db.createObjectStore(
                "objects_to_save",
                {
                    autoIncrement: true,
                }
            );
        }
        if (!db.objectStoreNames.contains("objects_to_delete")) {
            var objects_to_save = db.createObjectStore(
                "objects_to_delete",
                {
                    autoIncrement: true,
                }
            );
        }
    };
}
