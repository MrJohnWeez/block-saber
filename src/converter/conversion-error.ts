/**
 * Why a map failed to convert, mirroring the Unity converter's `MJW.Conversion.ConversionError` enum plus the
 * `MissingCover` and `UnsupportedVersion` values the browser pipeline needs for its stricter checks.
 */
export enum ConversionErrorKind {
  None = 'None',
  InvalidZipFile = 'InvalidZipFile',
  InvalidBeatMap = 'InvalidBeatMap',
  MissingInfo = 'MissingInfo',
  MissingSongData = 'MissingSongData',
  MissingSongFile = 'MissingSongFile',
  MissingCover = 'MissingCover',
  UnsupportedVersion = 'UnsupportedVersion',
  FailedToCopyFile = 'FailedToCopyFile',
  NoMapData = 'NoMapData',
  UnzipError = 'UnzipError',
  DuplicateDifficulty = 'DuplicateDifficulty',
  WallTooLong = 'WallTooLong',
  SongTooLong = 'SongTooLong',
  SlugCollision = 'SlugCollision',
  OtherFail = 'OtherFail',
  Canceled = 'Canceled',
}

/**
 * Error carrying a {@link ConversionErrorKind} so the conversion queue UI can show the right message.
 */
export class ConversionError extends Error {
  /** Machine-readable failure reason. */
  public readonly kind: ConversionErrorKind;

  /**
   * Create a conversion failure.
   *
   * @param kind Failure reason to surface to the user.
   * @param message Human-readable detail; never shown raw to users today but kept for debugging.
   */
  public constructor(kind: ConversionErrorKind, message: string) {
    super(message);
    this.name = 'ConversionError';
    this.kind = kind;
  }
}
