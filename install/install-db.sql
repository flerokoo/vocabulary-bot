CREATE TABLE IF NOT EXISTS "Words" (
	"id"	        INTEGER NOT NULL UNIQUE,
	"word"	        TEXT,
    "userId"	    TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "Definitions" (
	"id"	        INTEGER NOT NULL UNIQUE,
	"word"	        INTEGER,
	"definition"	TEXT NOT NULL,
	"example"	    TEXT,
	"userId"        TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY(word) REFERENCES Words(id) ON DELETE CASCADE
);
