Dataset originally created 11/6/2018

- UPDATE 12/27/18 (Added SHA256 and SHA512 checksum fields)
- UPDATE 12/3/18 (Removed offset and filename fields)


I. About This Dataset

This dataset is based on exploratory work begun by the Library of Congress's Web Archiving Team in 2018. The goal of the work is to explore the contents of the Library's web archives through analysis of the indexes containing metadata from the harvested web content, as stored in CDX files (https://web.archive.org/web/20171123000432/https://iipc.github.io/warc-specifications/specifications/cdx-format/cdx-2006/). The metadata contained in the indexes was used for initial analysis, rather than the archived content stored in WARC (https://www.loc.gov/preservation/digital/formats/fdd/fdd000236.shtml) and ARC (https://www.loc.gov/preservation/digital/formats/fdd/fdd000235.shtml) container files, since W/ARC files present significant challenges due to large size and high processing requirements. The CDX indexes used in this initial analysis were six terabytes (TB) in size, which is a fraction of the web archive content in W/ARC files constituting nearly 1.5 petabytes (PB) at the time of analysis (November 2018).

The majority of the information that is provided alongside the files was extracted by the Library's Web Archiving Team, through a process called CDX Line Extraction, which focused on the mimetype field pulled from the CDX indexes. Except when referencing this specific field, we have referred to this designation by its more current name, "media type" (http://webarchive.loc.gov/all/20171105042213/http://www.iana.org/assignments/media-types/media-types.xhtml), and therefore, all references to "media type" below may be considered to be derived from the mimetype field from the CDX indexes. See the "How Was It Created" section below for more information on this process.


II. What's Included?

This dataset includes:

- lcwa_gov_powerpoint_data.zip - compressed bag containing the 1,000 randomly selected files containing "powerpoint" in their media type from the archive, as well as manifest files with SHA-256 and SHA-512 checksums. The structure of the content follows the structure of the BagIt specification (see http://webarchive.loc.gov/all/20160830141859/https://tools.ietf.org/html/draft-kunze-bagit-08#section-2).

- lcwa_gov_powerpoint_metadata.csv - a CSV containing metadata derived from the CDX line entry for each Powerpoint file. The fields and their contents are described in the "Dataset Field Descriptions" section.


III. How Was It Created?

As mentioned above in the "About This Dataset" section, the bulk of this dataset was created using CDX Line Extraction. The extraction process used an Elastic MapReduce (EMR) cluster on AWS cloud services to run a series of MapReduce jobs (see https://en.wikipedia.org/wiki/MapReduce). The jobs filtered and sorted the CDX lines based on the following fields from the CDX line entries:

- digest: a unique cryptographic hash of the web object"s payload at the time of the crawl, which provides a distinct fingerprint for that object; it is a Base32 encoded SHA-1 hash.

- mimetype: two-part designation (type/subtype) that describes the nature and format of the web object, as reported by the server at the time of the crawl.

- statuscode: represents the HTTP response code from the server at the time of the crawl, e.g. 200, 404, etc.

- original: the original URL that was captured during the web harvesting process.

See the CDX specification for more information about the fields: https://web.archive.org/web/20171123000432/https://iipc.github.io/warc-specifications/specifications/cdx-format/cdx-2006/.

The CDX Line Extraction process involved multiple phases. First, a MapReduce job filtered out lines from the six terabyte corpus that were:

1) of the media type requested, in this case, media types that contained the string "powerpoint"

2) had a status code of 200

3) and whose top level domain from the original URL was ".gov"

The query results wrote matching lines to new CDX files, which were stored in an S3 bucket to be used in the next step. In this step, another MapReduce job pulled out all the digests from the filtered CDX files created by the first job and wrote them to a list that was also stored in an S3 bucket. Then, a Python script was used to randomly select one thousand digests from the digest list that was created by the second MapReduce job. Finally, a third MapReduce job took this subsection of one thousand digests as an input and extracted the CDX Line(s) each digest was referenced in, and wrote them to a CDX file that was stored in an S3 bucket. The CDX file from the final MapReduce Job was downloaded, converted to a CSV using a Python script, then used as the basis for any additional metadata extracted from the files or other computational methods of exploration.

Additional information not extracted from the CDX index was also created for use in tracking file integrity and basic metadata. Response headers information stored with the web archives (content length) furnished the data for the file_size field. If the header did not include the content length, the file size (in bytes) was obtained after the file was retrieved.


IV. Dataset Field Descriptions

This section lists and describes each of the fields included in lcwa_gov_powerpoint_metadata.csv. The CSV contains 15 fields (listed in the first line), and 1,000 lines with the corresponding information for each field as follows:

- urlkey: the URL of the captured web object, without the protocol (http://) or the leading www. This information was extracted from the CDX index file.

- timestamp: timestamp in the form YYYYMMDDhhmmss. The time represents the point at which the web object was captured, measured in GMT, as recorded in the CDX index file.

- original: the URL of the captured web object, including the protocol (http://) and the leading www, if applicable, extracted from the CDX index file.

- mimetype: the media type as recorded in the CDX.

- digest: a unique, cryptographic hash of the web object"s payload at the time of the crawl. This provides a distinct fingerprint for the object; it is a Base32 encoded SHA-1 hash, derived from the CDX index file.

- title: the title of the file according to information extracted with Apache Tika. In cases where no information was found, a value of "-" was recorded.

- company: the name of the "company" associated with the particular file in the dataset, according to information extracted with Apache Tika. In cases where no information was found, a value of "-" was recorded.

- creation_date: timestamp (YYYY-MM-DDThh:mm:ss) for when a particular file in the dataset was created, according to information extracted with Apache Tika. In cases where no information was found, a value of "-" was recorded.

- last_modified: timestamp (YYYY-MM-DDThh:mm:ss) of the most recent modification to a particular file in the dataset, according to information extracted with Apache Tika. In cases where no information was found, a value of "-" was recorded.

- revision_number: number of times a particular file in the dataset was revised according to the information extracted with Apache Tika. In cases where no information was found, a value of "-" was recorded.

- slide_count: number of slides in a particular file in the dataset according to the information extracted with Apache Tika. In cases where no information was found, a value of "-" was recorded.

- word_count: number of words in a particular file in the dataset according to the information extracted with Apache Tika. In cases where no information was found, a value of "-" was recorded.

- file_size: the size of the web object, in bytes, derived from additional processing methods used in conjunction with Apache Tika.

- sha256: a unique cryptographic hash of the downloaded web object, computed using the SHA-256 function from the SHA-2 algorithm. It serves as a checksum for the downloaded web object and was created during the bagit process.

- sha512: a unique cryptographic hash of the downloaded web object, computed using the SHA-512 function from the SHA-2 algorithm. It serves as a checksum for the downloaded web object and was created during the bagit process.


V. Rights Statement

This dataset was derived from content in the Library"s web archives. The Library follows a notification and permission process in the acquisition of content for the web archives, and to allow researcher access to the archived content, as described on the web archiving program page, https://www.loc.gov/programs/web-archiving/about-this-program/. Files were extracted from a variety of archived United States government websites collected in a number of event and thematic archives. See a representative Rights & Access statement for a sample collection which applies to all of the content in this dataset: https://www.loc.gov/collections/legislative-branch-web-archive/about-this-collection/rights-and-access/.


VI. Creator and Contributor Information

Creator: Chase Dooley

Contributors: Jesse Johnston, Abbie Grotke, Kate Murray, Grace Thomas


VII. Contact Information

Please direct all questions and comments to webcapture@loc.gov.
